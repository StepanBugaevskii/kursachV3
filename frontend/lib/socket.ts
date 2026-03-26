import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ WebSocket disconnected');
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Peer events
  registerPeer(data: { peerId: string; userId: string; clientType: string }): Promise<any> {
    return new Promise((resolve) => {
      this.socket?.emit('peer:register', data, (response: any) => {
        resolve(response);
      });
    });
  }

  sendHeartbeat(peerId: string): void {
    this.socket?.emit('peer:heartbeat', { peerId });
  }

  onPeerOnline(callback: (data: { peerId: string }) => void): void {
    this.socket?.on('peer:online', callback);
  }

  onPeerOffline(callback: (data: { peerId: string }) => void): void {
    this.socket?.on('peer:offline', callback);
  }

  // Chunk transfer events
  requestChunk(data: { fileId: string; chunkIndex: number; fromPeerId: string; toPeerId: string }): void {
    this.socket?.emit('chunk:request', data);
  }

  onChunkRequest(toPeerId: string, callback: (data: any) => void): void {
    this.socket?.on(`chunk:request:${toPeerId}`, callback);
  }

  onChunkResponse(toPeerId: string, callback: (data: any) => void): void {
    this.socket?.on(`chunk:response:${toPeerId}`, callback);
  }

  // WebRTC signaling
  sendOffer(data: { toPeerId: string; offer: any; fromPeerId: string }): void {
    this.socket?.emit('signaling:offer', data);
  }

  sendAnswer(data: { toPeerId: string; answer: any; fromPeerId: string }): void {
    this.socket?.emit('signaling:answer', data);
  }

  sendIceCandidate(data: { toPeerId: string; candidate: any; fromPeerId: string }): void {
    this.socket?.emit('signaling:ice-candidate', data);
  }

  onOffer(toPeerId: string, callback: (data: any) => void): void {
    this.socket?.on(`signaling:offer:${toPeerId}`, callback);
  }

  onAnswer(toPeerId: string, callback: (data: any) => void): void {
    this.socket?.on(`signaling:answer:${toPeerId}`, callback);
  }

  onIceCandidate(toPeerId: string, callback: (data: any) => void): void {
    this.socket?.on(`signaling:ice-candidate:${toPeerId}`, callback);
  }
}

export const socketService = new SocketService();
export default socketService;
