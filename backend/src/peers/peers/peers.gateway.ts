import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PeersService } from '../peers.service';

@WebSocketGateway({ cors: true })
export class PeersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly peersService: PeersService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const peerId = client.data.peerId;
    if (peerId) {
      await this.peersService.markOffline(peerId);
      this.server.emit('peer:offline', { peerId });
    }
  }

  @SubscribeMessage('peer:register')
  async handleRegister(
    @MessageBody() data: { peerId: string; userId: string; clientType: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.data.peerId = data.peerId;
    
    await this.peersService.register({
      peerId: data.peerId,
      userId: data.userId,
      clientType: data.clientType,
      isOnline: true,
    });

    this.server.emit('peer:online', { peerId: data.peerId });
    
    const onlinePeers = await this.peersService.findOnline();
    return { peers: onlinePeers };
  }

  @SubscribeMessage('peer:heartbeat')
  async handleHeartbeat(
    @MessageBody() data: { peerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    await this.peersService.markOnline(data.peerId);
    return { status: 'ok' };
  }

  @SubscribeMessage('chunk:request')
  async handleChunkRequest(
    @MessageBody() data: { fileId: string; chunkIndex: number; fromPeerId: string; toPeerId: string },
  ) {
    this.server.emit(`chunk:request:${data.toPeerId}`, {
      fileId: data.fileId,
      chunkIndex: data.chunkIndex,
      fromPeerId: data.fromPeerId,
    });
  }

  @SubscribeMessage('chunk:response')
  async handleChunkResponse(
    @MessageBody() data: { toPeerId: string; fileId: string; chunkIndex: number; data: number[] },
  ) {
    this.server.emit(`chunk:response:${data.toPeerId}`, {
      fileId: data.fileId,
      chunkIndex: data.chunkIndex,
      data: data.data,
    });
  }

  @SubscribeMessage('signaling:offer')
  async handleOffer(
    @MessageBody() data: { toPeerId: string; offer: any; fromPeerId: string },
  ) {
    this.server.emit(`signaling:offer:${data.toPeerId}`, {
      offer: data.offer,
      fromPeerId: data.fromPeerId,
    });
  }

  @SubscribeMessage('signaling:answer')
  async handleAnswer(
    @MessageBody() data: { toPeerId: string; answer: any; fromPeerId: string },
  ) {
    this.server.emit(`signaling:answer:${data.toPeerId}`, {
      answer: data.answer,
      fromPeerId: data.fromPeerId,
    });
  }

  @SubscribeMessage('signaling:ice-candidate')
  async handleIceCandidate(
    @MessageBody() data: { toPeerId: string; candidate: any; fromPeerId: string },
  ) {
    this.server.emit(`signaling:ice-candidate:${data.toPeerId}`, {
      candidate: data.candidate,
      fromPeerId: data.fromPeerId,
    });
  }
}
