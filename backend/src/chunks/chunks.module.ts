import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChunksService } from './chunks.service';
import { ChunksController } from './chunks.controller';
import { ChunkEntity } from './entities/chunk.entity';
import { ChunkReplicaEntity } from './entities/chunk-replica.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChunkEntity, ChunkReplicaEntity])],
  providers: [ChunksService],
  controllers: [ChunksController],
  exports: [ChunksService, TypeOrmModule]
})
export class ChunksModule {}
