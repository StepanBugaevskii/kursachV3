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
    console.log('🚀 Starting file download:', this.fileId);
    
    // 1. Get file metadata
    const file = await filesApi.getOne(this.fileId);
    console.log('📄 File metadata:', { name: file.fileName, size: file.size, chunks: Math.ceil(file.size / (1024 * 1024)) });

    // 2. Get chunks
    const chunks = await chunksApi.getByFile(this.fileId);
    const totalChunks = chunks.length;
    console.log(`📦 Total chunks to download: ${totalChunks}`);

    // 3. Check if P2P is initialized
    const p2pInitialized = webrtcClient.getPeerId() !== null;
    console.log(`🔌 P2P initialized: ${p2pInitialized}`);

    // 4. Get online peers to map userId to current P2P peerId
    let onlinePeersMap = new Map<string, string>();
    
    if (p2pInitialized) {
      try {
        const onlinePeersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/peers`);
        const onlinePeers = await onlinePeersResponse.json();
        onlinePeersMap = new Map(
          onlinePeers
            .filter((p: any) => p.isOnline)
            .map((p: any) => [p.userId, p.peerId])
        );
        console.log('📋 Online peers:', onlinePeers.length, 'peers');
        console.log('📋 Online peers map:', Array.from(onlinePeersMap.entries()));
      } catch (error) {
        console.warn('⚠️ Failed to fetch online peers:', error);
      }
    }

    // 5. Download chunks
    const chunkData: Uint8Array[] = new Array(totalChunks);

    for (let i = 0; i < totalChunks; i++) {
      const chunk = chunks[i];
      console.log(`\n📥 Processing chunk ${i + 1}/${totalChunks}`);
      
      // Try to get from local storage first
      let data = await this.getChunkFromLocal(this.fileId, i);
      let providers: any[] = [];

      if (data) {
        console.log(`✅ Chunk ${i} found in local storage`);
      } else {
        console.log(`🔍 Chunk ${i} not in local storage, requesting from peers...`);
        
        // Get from peers via P2P
        providers = await chunksApi.getProviders(chunk.id);
        
        console.log(`📦 Chunk ${i} providers:`, providers.length, 'providers');
        providers.forEach((p, idx) => {
          console.log(`  Provider ${idx + 1}:`, {
            dbPeerId: p.peerId,
            userId: (p as any).peer?.userId,
            p2pPeerId: (p as any).peer?.peerId,
            isOnline: (p as any).peer?.isOnline
          });
        });
        
        if (providers.length > 0 && p2pInitialized) {
          // Try each provider until successful
          for (const provider of providers) {
            try {
              // Get userId from provider.peer
              const userId = (provider as any).peer?.userId;
              
              if (!userId) {
                console.warn(`⚠️ No userId for provider ${provider.peerId}`);
                continue;
              }

              // Get current P2P peerId from online peers
              const currentP2PPeerId = onlinePeersMap.get(userId);
              
              if (!currentP2PPeerId || typeof currentP2PPeerId !== 'string') {
                console.warn(`⚠️ Peer ${userId} is not online or has invalid peerId`);
                continue;
              }

              console.log(`📥 Requesting chunk ${i} from peer ${currentP2PPeerId} (user: ${userId})`);
              
              data = await this.requestChunkFromPeer(
                currentP2PPeerId,
                this.fileId,
                i,
                30000 // 30 second timeout for large chunks
              );
              
              if (data) {
                // Store locally for future use
                await this.storeChunkLocally(this.fileId, i, data);
                console.log(`✅ Successfully downloaded chunk ${i} (${data.length} bytes)`);
                break;
              } else {
                console.warn(`⚠️ Received null data for chunk ${i} from peer ${currentP2PPeerId}`);
              }
            } catch (error) {
              console.warn(`❌ Failed to get chunk ${i} from peer:`, error);
              continue;
            }
          }
        } else if (!p2pInitialized) {
          console.error(`❌ P2P not initialized, cannot download chunk ${i}`);
        } else {
          console.error(`❌ No providers available for chunk ${i}`);
        }
      }

      if (data) {
        chunkData[i] = data;
        console.log(`✅ Chunk ${i} ready (${data.length} bytes)`);
      } else {
        const errorMsg = `Failed to download chunk ${i}. P2P initialized: ${p2pInitialized}, Providers: ${providers?.length || 0}`;
        console.error(`❌ ${errorMsg}`);
        throw new Error(errorMsg);
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

    console.log('🎉 All chunks downloaded, assembling file...');
    
    // 6. Combine chunks - cast to BlobPart for TypeScript
    const blob = new Blob(chunkData as BlobPart[], { type: file.mimeType });
    console.log(`✅ File assembled: ${blob.size} bytes`);
    
    return blob;
  }

  private async requestChunkFromPeer(
    peerId: string,
    fileId: string,
    chunkIndex: number,
    timeout: number = 30000
  ): Promise<Uint8Array | null> {
    try {
      // Request chunk via P2P WebRTC
      const data = await webrtcClient.requestChunk(peerId, fileId, chunkIndex, timeout);
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
