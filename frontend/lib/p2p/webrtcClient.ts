import { io, Socket } from 'socket.io-client';

interface PeerConnection {
  connection: RTCPeerConnection;
  dataChannel: RTCDataChannel | null;
  peerId: string;
}

interface ChunkRequest {
  fileId: string;
  chunkIndex: number;
  resolve: (data: Uint8Array) => void;
  reject: (error: Error) => void;
}

export class WebRTCClient {
  private socket: Socket | null = null;
  private peerId: string | null = null;
  private userId: string | null = null;
  private peers: Map<string, PeerConnection> = new Map();
  private pendingRequests: Map<string, ChunkRequest> = new Map();
  private onChunkRequestCallback: ((fileId: string, chunkIndex: number, fromPeerId: string) => Promise<Uint8Array | null>) | null = null;

  async initialize(userId: string, backendUrl: string = 'http://localhost:3000'): Promise<void> {
    this.userId = userId;
    this.peerId = `peer-${userId}-${Date.now()}`;

    this.socket = io(backendUrl, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.setupSocketListeners();
    
    // Setup global chunk request handler
    this.setupChunkRequestHandler();

    return new Promise((resolve, reject) => {
      this.socket!.emit('peer:register', {
        peerId: this.peerId,
        userId: this.userId,
        clientType: 'browser',
      }, (response: any) => {
        if (response.peers) {
          console.log('✅ Registered with signaling server', response.peers.length, 'peers online');
          resolve();
        } else {
          reject(new Error('Failed to register'));
        }
      });

      setTimeout(() => reject(new Error('Registration timeout')), 5000);
    });
  }

  private setupChunkRequestHandler(): void {
    // Global handler for chunk requests from other peers
    this.onChunkRequestCallback = async (fileId: string, chunkIndex: number, fromPeerId: string) => {
      try {
        const db = await this.openDatabase();
        const transaction = db.transaction(['chunks'], 'readonly');
        const store = transaction.objectStore('chunks');
        const request = store.get([fileId, chunkIndex]);

        return new Promise<Uint8Array | null>((resolve) => {
          request.onsuccess = () => {
            const result = request.result?.data || null;
            if (result) {
              console.log(`✅ Found chunk ${chunkIndex} locally for file ${fileId}`);
            } else {
              console.warn(`⚠️ Chunk ${chunkIndex} not found locally for file ${fileId}`);
            }
            resolve(result);
          };
          request.onerror = () => {
            console.error(`❌ Error reading chunk ${chunkIndex} from IndexedDB`);
            resolve(null);
          };
        });
      } catch (error) {
        console.error('Error accessing IndexedDB:', error);
        return null;
      }
    };
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

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on(`signaling:offer:${this.peerId}`, async (data: { offer: RTCSessionDescriptionInit; fromPeerId: string }) => {
      await this.handleOffer(data.offer, data.fromPeerId);
    });

    this.socket.on(`signaling:answer:${this.peerId}`, async (data: { answer: RTCSessionDescriptionInit; fromPeerId: string }) => {
      await this.handleAnswer(data.answer, data.fromPeerId);
    });

    this.socket.on(`signaling:ice-candidate:${this.peerId}`, async (data: { candidate: RTCIceCandidateInit; fromPeerId: string }) => {
      await this.handleIceCandidate(data.candidate, data.fromPeerId);
    });

    this.socket.on(`chunk:request:${this.peerId}`, async (data: { fileId: string; chunkIndex: number; fromPeerId: string }) => {
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

  async connectToPeer(peerId: string): Promise<void> {
    if (this.peers.has(peerId)) {
      console.log('Already connected to peer:', peerId);
      return;
    }

    const peerConnection = this.createPeerConnection(peerId);
    const dataChannel = peerConnection.createDataChannel('fileTransfer', {
      ordered: true,
    });

    this.setupDataChannel(dataChannel, peerId);

    const peer: PeerConnection = {
      connection: peerConnection,
      dataChannel,
      peerId,
    };

    this.peers.set(peerId, peer);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    this.socket!.emit('signaling:offer', {
      toPeerId: peerId,
      offer: offer,
      fromPeerId: this.peerId,
    });
  }

  private createPeerConnection(peerId: string): RTCPeerConnection {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(config);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket!.emit('signaling:ice-candidate', {
          toPeerId: peerId,
          candidate: event.candidate,
          fromPeerId: this.peerId,
        });
      }
    };

    pc.ondatachannel = (event) => {
      this.setupDataChannel(event.channel, peerId);
      const peer = this.peers.get(peerId);
      if (peer) {
        peer.dataChannel = event.channel;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${peerId}:`, pc.connectionState);
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        this.closePeerConnection(peerId);
      }
    };

    return pc;
  }

  private setupDataChannel(channel: RTCDataChannel, peerId: string): void {
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      console.log(`✅ Data channel opened with ${peerId}`);
    };

    channel.onclose = () => {
      console.log(`Data channel closed with ${peerId}`);
    };

    channel.onerror = (error) => {
      console.error(`Data channel error with ${peerId}:`, error);
    };

    channel.onmessage = (event) => {
      this.handleDataChannelMessage(event.data, peerId);
    };
  }

  private handleDataChannelMessage(data: ArrayBuffer, fromPeerId: string): void {
    const view = new DataView(data);
    const messageType = view.getUint8(0);

    if (messageType === 1) {
      // Chunk data response
      const fileIdLength = view.getUint8(1);
      const fileId = new TextDecoder().decode(new Uint8Array(data, 2, fileIdLength));
      const chunkIndex = view.getUint32(2 + fileIdLength, true);
      const chunkData = new Uint8Array(data, 6 + fileIdLength);

      console.log(`✅ Received chunk ${chunkIndex} from ${fromPeerId}, size: ${chunkData.length} bytes`);

      const requestKey = `${fileId}-${chunkIndex}`;
      const request = this.pendingRequests.get(requestKey);
      
      if (request) {
        request.resolve(chunkData);
        this.pendingRequests.delete(requestKey);
      } else {
        console.warn(`⚠️ No pending request for chunk: ${requestKey}`);
      }
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit, fromPeerId: string): Promise<void> {
    let peer = this.peers.get(fromPeerId);
    
    if (!peer) {
      const peerConnection = this.createPeerConnection(fromPeerId);
      peer = {
        connection: peerConnection,
        dataChannel: null,
        peerId: fromPeerId,
      };
      this.peers.set(fromPeerId, peer);
    }

    await peer.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);

    this.socket!.emit('signaling:answer', {
      toPeerId: fromPeerId,
      answer: answer,
      fromPeerId: this.peerId,
    });
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit, fromPeerId: string): Promise<void> {
    const peer = this.peers.get(fromPeerId);
    if (peer) {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(answer));
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidateInit, fromPeerId: string): Promise<void> {
    const peer = this.peers.get(fromPeerId);
    if (peer) {
      await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  private async handleChunkRequest(fileId: string, chunkIndex: number, fromPeerId: string): Promise<void> {
    console.log(`📨 Received chunk request: file=${fileId}, chunk=${chunkIndex}, from=${fromPeerId}`);
    
    if (!this.onChunkRequestCallback) {
      console.warn('⚠️ No chunk request handler registered');
      return;
    }

    const chunkData = await this.onChunkRequestCallback(fileId, chunkIndex, fromPeerId);
    
    if (chunkData) {
      console.log(`📤 Sending chunk ${chunkIndex} to ${fromPeerId}, size: ${chunkData.length} bytes`);
      await this.sendChunkData(fromPeerId, fileId, chunkIndex, chunkData);
    } else {
      console.warn(`⚠️ Chunk ${chunkIndex} not found locally`);
    }
  }

  async requestChunk(peerId: string, fileId: string, chunkIndex: number, timeout: number = 10000): Promise<Uint8Array> {
    console.log(`📥 Requesting chunk ${chunkIndex} from peer ${peerId}`);
    
    const peer = this.peers.get(peerId);
    
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      console.log(`⚠️ No active connection to ${peerId}, connecting...`);
      await this.connectToPeer(peerId);
      await this.waitForDataChannel(peerId, 5000);
    }

    return new Promise((resolve, reject) => {
      const requestKey = `${fileId}-${chunkIndex}`;
      this.pendingRequests.set(requestKey, { fileId, chunkIndex, resolve, reject });

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
          console.error(`⏱️ Chunk request timeout: ${requestKey}`);
          reject(new Error('Chunk request timeout'));
        }
      }, timeout);
    });
  }

  private async sendChunkData(peerId: string, fileId: string, chunkIndex: number, data: Uint8Array): Promise<void> {
    const peer = this.peers.get(peerId);
    
    if (!peer || !peer.dataChannel || peer.dataChannel.readyState !== 'open') {
      throw new Error('Data channel not ready');
    }

    const fileIdBytes = new TextEncoder().encode(fileId);
    const header = new Uint8Array(2 + fileIdBytes.length + 4);
    const view = new DataView(header.buffer);
    
    view.setUint8(0, 1); // Message type: chunk data
    view.setUint8(1, fileIdBytes.length);
    header.set(fileIdBytes, 2);
    view.setUint32(2 + fileIdBytes.length, chunkIndex, true);

    const message = new Uint8Array(header.length + data.length);
    message.set(header, 0);
    message.set(data, header.length);

    peer.dataChannel.send(message);
  }

  private async waitForDataChannel(peerId: string, timeout: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const peer = this.peers.get(peerId);
      if (peer?.dataChannel?.readyState === 'open') {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Data channel connection timeout');
  }

  onChunkRequest(callback: (fileId: string, chunkIndex: number, fromPeerId: string) => Promise<Uint8Array | null>): void {
    this.onChunkRequestCallback = callback;
  }

  private closePeerConnection(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      peer.dataChannel?.close();
      peer.connection.close();
      this.peers.delete(peerId);
    }
  }

  getConnectedPeers(): string[] {
    return Array.from(this.peers.keys()).filter(peerId => {
      const peer = this.peers.get(peerId);
      return peer?.dataChannel?.readyState === 'open';
    });
  }

  getPeerId(): string | null {
    return this.peerId;
  }

  isConnected(peerId: string): boolean {
    const peer = this.peers.get(peerId);
    return peer?.dataChannel?.readyState === 'open' || false;
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
