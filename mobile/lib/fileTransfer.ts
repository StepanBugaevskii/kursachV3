import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Config } from '@/constants/Config';
import api from './api';
import { storeChunk, getChunk } from './storage/database';
import { webrtcClient } from './p2p/webrtcClient';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
}

export class FileUploader {
  private fileUri: string;
  private fileName: string;
  private fileSize: number;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(
    fileUri: string,
    fileName: string,
    fileSize: number,
    onProgress?: (progress: UploadProgress) => void
  ) {
    this.fileUri = fileUri;
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.onProgress = onProgress;
  }

  async upload(ownerId: string): Promise<string> {
    console.log('🚀 Starting file upload:', this.fileName);

    // 1. Calculate file hash
    const fileHash = await this.calculateFileHash();

    // 2. Create file metadata
    const fileMetadata = await api.post('/files', {
      ownerId,
      fileName: this.fileName,
      originalName: this.fileName,
      size: this.fileSize,
      mimeType: this.getMimeType(),
      hash: fileHash,
    });

    const fileId = fileMetadata.data.id;

    // 3. Split file into chunks
    const totalChunks = Math.ceil(this.fileSize / Config.CHUNK_SIZE);
    console.log(`📦 Total chunks: ${totalChunks}`);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * Config.CHUNK_SIZE;
      const end = Math.min(start + Config.CHUNK_SIZE, this.fileSize);
      
      // Read chunk from file
      const chunkData = await this.readChunk(start, end - start);
      const chunkHash = await this.calculateChunkHash(chunkData);

      // Store chunk locally
      await storeChunk(fileId, i, chunkData, chunkHash);

      // Upload chunk metadata
      const chunkMetadata = await api.post('/chunks', {
        fileId,
        chunkIndex: i,
        chunkHash,
        chunkSize: chunkData.length,
        encryptionStatus: false,
      });

      // Register as provider
      const currentP2PPeerId = webrtcClient.getPeerId();
      if (currentP2PPeerId) {
        try {
          const peersResponse = await api.get('/peers');
          const peers = peersResponse.data;
          let peer = peers.find((p: any) => p.peerId === currentP2PPeerId);

          if (!peer) {
            const registerResponse = await api.post('/peers', {
              peerId: currentP2PPeerId,
              userId: ownerId,
              clientType: 'mobile',
              isOnline: true,
            });
            peer = registerResponse.data;
          }

          await api.post('/chunks/replicas', {
            chunkId: chunkMetadata.data.id,
            peerId: peer.id,
            replicaPriority: 1,
            healthStatus: 'healthy',
          });
        } catch (error) {
          console.warn('Failed to register chunk replica:', error);
        }
      }

      // Report progress
      this.onProgress?.({
        loaded: end,
        total: this.fileSize,
        percentage: Math.round((end / this.fileSize) * 100),
        currentChunk: i + 1,
        totalChunks,
      });
    }

    console.log('✅ File upload complete:', fileId);
    return fileId;
  }

  private async readChunk(start: number, length: number): Promise<Uint8Array> {
    const base64 = await FileSystem.readAsStringAsync(this.fileUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: start,
      length,
    });
    
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private async calculateFileHash(): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      this.fileUri,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return hash;
  }

  private async calculateChunkHash(data: Uint8Array): Promise<string> {
    const base64 = btoa(String.fromCharCode(...data));
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      base64,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
    return hash;
  }

  private getMimeType(): string {
    const ext = this.fileName.split('.').pop()?.toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      mp4: 'video/mp4',
      mp3: 'audio/mpeg',
      txt: 'text/plain',
      zip: 'application/zip',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

export class FileDownloader {
  private fileId: string;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(fileId: string, onProgress?: (progress: UploadProgress) => void) {
    this.fileId = fileId;
    this.onProgress = onProgress;
  }

  async download(): Promise<string> {
    console.log('🚀 Starting file download:', this.fileId);

    // 1. Get file metadata
    const fileResponse = await api.get(`/files/${this.fileId}`);
    const file = fileResponse.data;

    // 2. Get chunks
    const chunksResponse = await api.get(`/chunks?fileId=${this.fileId}`);
    const chunks = chunksResponse.data;
    const totalChunks = chunks.length;

    console.log(`📦 Total chunks to download: ${totalChunks}`);

    // 3. Get online peers
    const peersResponse = await api.get('/peers');
    const onlinePeers = peersResponse.data.filter((p: any) => p.isOnline);
    const onlinePeersMap = new Map(
      onlinePeers.map((p: any) => [p.userId, p.peerId])
    );

    console.log('📋 Online peers:', onlinePeers.length);

    // 4. Download chunks
    const downloadDir = FileSystem.documentDirectory + 'downloads/';
    await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    
    const filePath = downloadDir + file.fileName;
    
    // Create empty file
    await FileSystem.writeAsStringAsync(filePath, '', { encoding: FileSystem.EncodingType.Base64 });

    for (let i = 0; i < totalChunks; i++) {
      const chunk = chunks[i];
      console.log(`\n📥 Processing chunk ${i + 1}/${totalChunks}`);

      // Try local storage first
      let data = await getChunk(this.fileId, i);

      if (!data) {
        // Get from peers via P2P
        const providersResponse = await api.get(`/chunks/${chunk.id}/providers`);
        const providers = providersResponse.data;

        console.log(`📦 Chunk ${i} providers:`, providers.length);

        if (providers.length > 0) {
          for (const provider of providers) {
            try {
              const userId = provider.peer?.userId;
              if (!userId) continue;

              const currentP2PPeerId = onlinePeersMap.get(userId);
              if (!currentP2PPeerId) continue;

              console.log(`📥 Requesting chunk ${i} from peer ${currentP2PPeerId}`);

              data = await webrtcClient.requestChunk(
                currentP2PPeerId,
                this.fileId,
                i,
                30000
              );

              if (data) {
                await storeChunk(this.fileId, i, data);
                console.log(`✅ Successfully downloaded chunk ${i}`);
                break;
              }
            } catch (error) {
              console.warn(`❌ Failed to get chunk ${i}:`, error);
              continue;
            }
          }
        }
      }

      if (!data) {
        throw new Error(`Failed to download chunk ${i}`);
      }

      // Append chunk to file
      const base64Data = btoa(String.fromCharCode(...data));
      const currentContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.writeAsStringAsync(filePath, currentContent + base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Report progress
      this.onProgress?.({
        loaded: (i + 1) * chunk.chunkSize,
        total: file.size,
        percentage: Math.round(((i + 1) / totalChunks) * 100),
        currentChunk: i + 1,
        totalChunks,
      });
    }

    console.log('✅ File download complete:', filePath);
    return filePath;
  }
}
