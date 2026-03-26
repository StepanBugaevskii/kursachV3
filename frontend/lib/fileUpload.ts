import { filesApi } from '@/modules/files/http/files.api';
import { chunksApi } from '@/modules/chunks/http/chunks.api';
import { webrtcClient } from '@/lib/p2p/webrtcClient';
import CryptoJS from 'crypto-js';

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentChunk: number;
  totalChunks: number;
}

export class FileUploader {
  private file: File;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(file: File, onProgress?: (progress: UploadProgress) => void) {
    this.file = file;
    this.onProgress = onProgress;
  }

  async upload(ownerId: string): Promise<string> {
    // 1. Calculate file hash
    const fileHash = await this.calculateFileHash();

    // 2. Create file metadata
    const fileMetadata = await filesApi.create({
      ownerId,
      fileName: this.file.name,
      originalName: this.file.name,
      size: this.file.size,
      mimeType: this.file.type || 'application/octet-stream',
      hash: fileHash,
    });

    // 3. Split file into chunks
    const totalChunks = Math.ceil(this.file.size / CHUNK_SIZE);
    const chunks: { index: number; data: Uint8Array; hash: string }[] = [];

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, this.file.size);
      const chunkBlob = this.file.slice(start, end);
      const chunkData = new Uint8Array(await chunkBlob.arrayBuffer());
      const chunkHash = await this.calculateChunkHash(chunkData);

      chunks.push({
        index: i,
        data: chunkData,
        hash: chunkHash,
      });

      // Report progress
      this.onProgress?.({
        loaded: end,
        total: this.file.size,
        percentage: Math.round((end / this.file.size) * 100),
        currentChunk: i + 1,
        totalChunks,
      });
    }

    // 4. Store chunks locally first (IndexedDB)
    await this.storeChunksLocally(fileMetadata.id, chunks);

    // 5. Upload chunk metadata to backend
    const currentP2PPeerId = webrtcClient.getPeerId();
    
    // 6. Register as peer if not already registered
    let peerDbId: string | null = null;
    if (currentP2PPeerId) {
      try {
        // Check if peer exists, if not create it
        const peersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peers`);
        const peers = await peersResponse.json();
        let peer = peers.find((p: any) => p.peerId === currentP2PPeerId);
        
        if (!peer) {
          // Register new peer
          const registerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              peerId: currentP2PPeerId,
              userId: ownerId,
              clientType: 'browser',
              isOnline: true,
            }),
          });
          peer = await registerResponse.json();
        }
        
        peerDbId = peer.id; // UUID from database
      } catch (error) {
        console.warn('Failed to register peer:', error);
      }
    }
    
    for (const chunk of chunks) {
      const chunkMetadata = await chunksApi.create({
        fileId: fileMetadata.id,
        chunkIndex: chunk.index,
        chunkHash: chunk.hash,
        chunkSize: chunk.data.length,
        encryptionStatus: false,
      });

      // Register this peer as provider of the chunk using database peer ID
      if (peerDbId) {
        try {
          await chunksApi.addReplica({
            chunkId: chunkMetadata.id,
            peerId: peerDbId, // Use database UUID, not P2P peerId
            replicaPriority: 1,
            healthStatus: 'healthy',
          });
        } catch (error) {
          console.warn('Failed to register chunk replica:', error);
        }
      }
    }

    return fileMetadata.id;
  }

  private async calculateFileHash(): Promise<string> {
    const arrayBuffer = await this.file.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
    return CryptoJS.SHA256(wordArray).toString();
  }

  private async calculateChunkHash(data: Uint8Array): Promise<string> {
    const wordArray = CryptoJS.lib.WordArray.create(data as any);
    return CryptoJS.SHA256(wordArray).toString();
  }

  private async storeChunksLocally(
    fileId: string,
    chunks: { index: number; data: Uint8Array; hash: string }[]
  ): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(['chunks'], 'readwrite');
    const store = transaction.objectStore('chunks');

    for (const chunk of chunks) {
      await store.put({
        fileId,
        index: chunk.index,
        data: chunk.data,
        hash: chunk.hash,
      });
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MeshShareDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('chunks')) {
          db.createObjectStore('chunks', { keyPath: ['fileId', 'index'] });
        }
      };
    });
  }
}

export class FileDownloader {
  private fileId: string;
  private onProgress?: (progress: UploadProgress) => void;

  constructor(fileId: string, onProgress?: (progress: UploadProgress) => void) {
    this.fileId = fileId;
    this.onProgress = onProgress;
  }

  async download(): Promise<Blob> {
    // 1. Get file metadata
    const file = await filesApi.getOne(this.fileId);

    // 2. Get chunks
    const chunks = await chunksApi.getByFile(this.fileId);
    const totalChunks = chunks.length;

    // 3. Download chunks
    const chunkData: Uint8Array[] = new Array(totalChunks);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = chunks[i];
      
      // Try to get from local storage first
      let data = await this.getChunkFromLocal(this.fileId, i);

      if (!data) {
        // Get from peers via P2P
        const providers = await chunksApi.getProviders(chunk.id);
        
        if (providers.length > 0) {
          // Try each provider until successful
          for (const provider of providers) {
            try {
              // Use peer.peerId (P2P identifier) instead of provider.peerId (database UUID)
              const p2pPeerId = (provider as any).peer?.peerId || provider.peerId;
              
              console.log(`Requesting chunk ${i} from peer ${p2pPeerId}`);
              
              data = await this.requestChunkFromPeer(
                p2pPeerId,
                this.fileId,
                i
              );
              
              if (data) {
                // Store locally for future use
                await this.storeChunkLocally(this.fileId, i, data);
                console.log(`✅ Successfully downloaded chunk ${i}`);
                break;
              }
            } catch (error) {
              console.warn(`Failed to get chunk ${i} from peer:`, error);
              continue;
            }
          }
        }
      }

      if (data) {
        chunkData[i] = data;
      } else {
        throw new Error(`Failed to download chunk ${i}`);
      }

      // Report progress
      this.onProgress?.({
        loaded: (i + 1) * chunk.chunkSize,
        total: file.size,
        percentage: Math.round(((i + 1) / totalChunks) * 100),
        currentChunk: i + 1,
        totalChunks,
      });
    }

    // 4. Combine chunks - cast to BlobPart for TypeScript
    return new Blob(chunkData as BlobPart[], { type: file.mimeType });
  }

  private async requestChunkFromPeer(
    peerId: string,
    fileId: string,
    chunkIndex: number
  ): Promise<Uint8Array | null> {
    try {
      // Request chunk via P2P WebRTC
      const data = await webrtcClient.requestChunk(peerId, fileId, chunkIndex, 10000);
      return data;
    } catch (error) {
      console.error('Failed to request chunk from peer:', error);
      return null;
    }
  }

  private async getChunkFromLocal(fileId: string, index: number): Promise<Uint8Array | null> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['chunks'], 'readonly');
      const store = transaction.objectStore('chunks');
      const request = store.get([fileId, index]);

      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve(request.result?.data || null);
        };
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  private async storeChunkLocally(
    fileId: string,
    index: number,
    data: Uint8Array
  ): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction(['chunks'], 'readwrite');
      const store = transaction.objectStore('chunks');
      
      await store.put({
        fileId,
        index,
        data,
      });
    } catch (error) {
      console.warn('Failed to store chunk locally:', error);
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MeshShareDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('chunks')) {
          db.createObjectStore('chunks', { keyPath: ['fileId', 'index'] });
        }
      };
    });
  }
}
