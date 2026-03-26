import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChunksService } from './chunks.service';
import { ChunkEntity } from './entities/chunk.entity';
import { ChunkReplicaEntity } from './entities/chunk-replica.entity';

@Controller('chunks')
export class ChunksController {
  constructor(private readonly chunksService: ChunksService) {}

  @Post()
  async create(@Body() chunkData: Partial<ChunkEntity>) {
    return await this.chunksService.create(chunkData);
  }

  @Get()
  async findByFile(@Query('fileId') fileId: string) {
    return await this.chunksService.findByFile(fileId);
  }

  @Get(':chunkId/providers')
  async findProviders(@Param('chunkId') chunkId: string) {
    return await this.chunksService.findProviders(chunkId);
  }

  @Post('replicas')
  async addReplica(@Body() replicaData: Partial<ChunkReplicaEntity>) {
    return await this.chunksService.addReplica(replicaData);
  }
}
