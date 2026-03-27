import { io, Socket } from 'socket.io-client';
import { Config } from '@/constants/Config';
import { getChunk } from '@/lib/storage/database';

interface PeerConnection {
  connection: any; // RTCPeerConnection from react-native-webrtc
  dataChannel: any | null;
  peerId: string;
}

interface ChunkRequest {
  fileId: string;
  chunkIndex: number;
  resolve: (data: Uint8Array) => void;
  reject: (error: Error) => void;
}

interface ChunkAssembly {
  parts: Map<number, Uint8Array>;
  totalParts: number;
  fileId: string;
  chunkIndex: number;
}

class WebRTCClient {
  private socket: Socket | null = null;
  private peerId: string | null = null;
  private userId: string | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private pendingRequests: Map<string, ChunkRequest> = new Map();
  private chunkAssemblies: Map<string, ChunkAssembly> = new Map();
  private onChunkRequestCallback: ((
    fileId: string,
    chunkIndex: number,
    fromPeerId: string
  ) => Promise<Uint8Array | null>) | null = null;

  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    this.peerId = `peer-${userId}-${Date.now()}`;

    this.socket = io(Config.API_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.setupSocketListeners();
    this.setupChunkRequestHandler();

    return new Promise((resolve, reject) => {
      this.socket!.emit(
        'peer:register',
        {
          peerId: this.peerId,
          userId: this.userId,
          clientType: 'mobile',
        },
        (response: any) => {
          if (response.peers) {
            console.log('✅ P2P initialized:', response.peers.length, 'peers online');
            resolve();
          } else {
            reject(new Error('Failed to register'));
          }
        }
      );

      setTimeout(() => reject(new Error('Registration timeout')), 5000);
    });
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on(`chunk:request:${this.peerId}`, async (data: any) => {
      console.log(`📨 Received chunk request: chunk ${data.chunkIndex} from ${data.fromPeerId}`);
      await this.handleChunkRequest(data.fileId, data.chunkIndex, data.fromPeerId);
    });

    this.socket.on('peer:online', (data: { peerId: string }) => {
      console.log('Peer came online:', data.peerId);
    });

    this.socket.on('peer:offline', (data: { peerId: string }) => {
      console.log('Peer went offline:', data.peerId);
      this.closePeerConnection(data.peerId);
    });
  }

  private setupChunkRequestHandler(): void {
    this.onChunkRequestCallback = async (fileId: string, chunkIndex: number) => {
      try {
        const data = await getChunk(fileId, chunkIndex);
        if (data) {
          console.log(`✅ Found chunk ${chunkIndex} locally for file ${fileId}`);
        } else {
          console.warn(`⚠️ Chunk ${chunkIndex} not found locally for file ${fileId}`);
        }
        return data;
      } catch (error) {
        console.error('Error accessing database:', error);
        return null;
      }
    };
  }

  private async handleChunkRequest(
    fileId: string,
    chunkIndex: number,
    fromPeerId: string
  ): Promise<void> {
    console.log(`📨 Handling chunk request: file=${fileId}, chunk=${chunkIndex}, from=${fromPeerId}`);

    if (!this.onChunkRequestCallback) {
      console.warn('⚠️ No chunk request handler registered');
      return;
    }

    const chunkData = await this.onChunkRequestCallback(fileId, chunkIndex, fromPeerId);

    if (chunkData) {
      console.log(`📤 Sending chunk ${chunkIndex} to ${fromPeerId}, size: ${chunkData.length} bytes`);
      // In React Native, we'll send via socket for simplicity (WebRTC DataChannel is complex)
      this.socket!.emit('chunk:response', {
        toPeerId: fromPeerId,
        fileId,
        chunkIndex,
        data: Array.from(chunkData), // Convert to array for JSON
      });
    } else {
      console.warn(`⚠️ Chunk ${chunkIndex} not found locally`);
    }
  }

  async requestChunk(
    peerId: string,
    fileId: string,
    chunkIndex: number,
    timeout: number = 30000
  ): Promise<Uint8Array> {
    console.log(`📥 Requesting chunk ${chunkIndex} from peer ${peerId}`);

    return new Promise((resolve, reject) => {
      const requestKey = `${fileId}-${chunkIndex}`;
      this.pendingRequests.set(requestKey, { fileId, chunkIndex, resolve, reject });

      // Listen for response
      const responseHandler = (data: any) => {
        if (data.fileId === fileId && data.chunkIndex === chunkIndex) {
          console.log(`✅ Received chunk ${chunkIndex}, size: ${data.data.length} bytes`);
          const chunkData = new Uint8Array(data.data);
          
          const request = this.pendingRequests.get(requestKey);
          if (request) {
            request.resolve(chunkData);
            this.pendingRequests.delete(requestKey);
          }
          
          this.socket!.off(`chunk:response:${this.peerId}`, responseHandler);
        }
      };

      this.socket!.on(`chunk:response:${this.peerId}`, responseHandler);

      console.log(`📤 Sending chunk request via socket: ${requestKey}`);

      this.socket!.emit('chunk:request', {
        fileId,
        chunkIndex,
        fromPeerId: this.peerId,
        toPeerId: peerId,
      });

      setTimeout(() => {
        if (this.pendingRequests.has(requestKey)) {
          this.pendingRequests.delete(requestKey);
          this.socket!.off(`chunk:response:${this.peerId}`, responseHandler);
          console.error(`⏱️ Chunk request timeout: ${requestKey}`);
          reject(new Error('Chunk request timeout'));
        }
      }, timeout);
    });
  }

  private closePeerConnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.dataChannel?.close();
      peer.connection?.close();
      this.peers.delete(peerId);
    }
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys());
  }

  getPeerId(): string | null {
    return this.peerId;
  }

  isConnected(peerId: string): boolean {
    return this.peers.has(peerId);
  }

  async shutdown(): Promise<void> {
    for (const peerId of this.peers.keys()) {
      this.closePeerConnection(peerId);
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.peerId = null;
    this.userId = null;
  }
}

export const webrtcClient = new WebRTCClient();
