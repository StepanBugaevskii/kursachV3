import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { PeersService } from './peers.service';
import { PeerEntity } from './entities/peer.entity';

@Controller('peers')
export class PeersController {
  constructor(private readonly peersService: PeersService) {}

  @Post('register')
  async register(@Body() peerData: Partial<PeerEntity>) {
    return await this.peersService.register(peerData);
  }

  @Get()
  async findAll() {
    return await this.peersService.findAll();
  }

  @Get('online')
  async findOnline() {
    return await this.peersService.findOnline();
  }

  @Get(':peerId')
  async findOne(@Param('peerId') peerId: string) {
    return await this.peersService.findByPeerId(peerId);
  }

  @Post(':peerId/online')
  async markOnline(@Param('peerId') peerId: string) {
    await this.peersService.markOnline(peerId);
    return { message: 'Peer marked online' };
  }

  @Post(':peerId/offline')
  async markOffline(@Param('peerId') peerId: string) {
    await this.peersService.markOffline(peerId);
    return { message: 'Peer marked offline' };
  }

  @Delete(':peerId')
  async remove(@Param('peerId') peerId: string) {
    await this.peersService.remove(peerId);
    return { message: 'Peer removed' };
  }
}
