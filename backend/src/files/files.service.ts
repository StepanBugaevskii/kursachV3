import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from './entities/file.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
  ) {}

  async create(fileData: Partial<FileEntity>): Promise<FileEntity> {
    const file = this.filesRepository.create(fileData);
    return await this.filesRepository.save(file);
  }

  async findAll(): Promise<FileEntity[]> {
    return await this.filesRepository.find({ relations: ['owner', 'chunks'] });
  }

  async findOne(id: string): Promise<FileEntity> {
    return await this.filesRepository.findOne({ 
      where: { id }, 
      relations: ['owner', 'chunks'] 
    });
  }

  async findByOwner(ownerId: string): Promise<FileEntity[]> {
    return await this.filesRepository.find({ where: { ownerId } });
  }

  async update(id: string, fileData: Partial<FileEntity>): Promise<FileEntity> {
    await this.filesRepository.update(id, fileData);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.filesRepository.delete(id);
  }
}
