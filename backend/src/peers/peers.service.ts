import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PeerEntity } from './entities/peer.entity';

@Injectable()
export class PeersService {
  constructor(
    @InjectRepository(PeerEntity)
    private peersRepository: Repository<PeerEntity>,
  ) {}

  async register(peerData: Partial<PeerEntity>): Promise<PeerEntity> {
    const peer = this.peersRepository.create({ ...peerData, isOnline: true });
    return await this.peersRepository.save(peer);
  }

  async findAll(): Promise<PeerEntity[]> {
    return await this.peersRepository.find({ relations: ['user'] });
  }

  async findOnline(): Promise<PeerEntity[]> {
    return await this.peersRepository.find({ where: { isOnline: true } });
  }

  async findByPeerId(peerId: string): Promise<PeerEntity> {
    return await this.peersRepository.findOne({ where: { peerId } });
  }

  async markOnline(peerId: string): Promise<void> {
    await this.peersRepository.update({ peerId }, { isOnline: true, lastSeenAt: new Date() });
  }

  async markOffline(peerId: string): Promise<void> {
    await this.peersRepository.update({ peerId }, { isOnline: false });
  }

  async remove(peerId: string): Promise<void> {
    await this.peersRepository.delete({ peerId });
  }
}
