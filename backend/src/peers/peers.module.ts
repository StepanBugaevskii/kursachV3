import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeersGateway } from './peers/peers.gateway';
import { PeersService } from './peers.service';
import { PeersController } from './peers.controller';
import { PeerEntity } from './entities/peer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PeerEntity])],
  providers: [PeersGateway, PeersService],
  controllers: [PeersController],
  exports: [PeersService, TypeOrmModule]
})
export class PeersModule {}
