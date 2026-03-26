import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChunkEntity } from './entities/chunk.entity';
import { ChunkReplicaEntity } from './entities/chunk-replica.entity';

@Injectable()
export class ChunksService {
  constructor(
    @InjectRepository(ChunkEntity)
    private chunksRepository: Repository<ChunkEntity>,
    @InjectRepository(ChunkReplicaEntity)
    private replicasRepository: Repository<ChunkReplicaEntity>,
  ) {}

  async create(chunkData: Partial<ChunkEntity>): Promise<ChunkEntity> {
    const chunk = this.chunksRepository.create(chunkData);
    return await this.chunksRepository.save(chunk);
  }

  async findByFile(fileId: string): Promise<ChunkEntity[]> {
    return await this.chunksRepository.find({ 
      where: { fileId },
      relations: ['replicas', 'replicas.peer']
    });
  }

  async findProviders(chunkId: string): Promise<ChunkReplicaEntity[]> {
    return await this.replicasRepository.find({
      where: { chunkId, healthStatus: 'healthy' },
      relations: ['peer']
    });
  }

  async addReplica(replicaData: Partial<ChunkReplicaEntity>): Promise<ChunkReplicaEntity> {
    const replica = this.replicasRepository.create(replicaData);
    return await this.replicasRepository.save(replica);
  }

  async removeReplica(chunkId: string, peerId: string): Promise<void> {
    await this.replicasRepository.delete({ chunkId, peerId });
  }
}
