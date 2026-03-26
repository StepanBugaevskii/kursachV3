import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async create(@Body() fileData: Partial<FileEntity>) {
    return await this.filesService.create(fileData);
  }

  @Get()
  async findAll(@Query('ownerId') ownerId?: string) {
    if (ownerId) {
      return await this.filesService.findByOwner(ownerId);
    }
    return await this.filesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.filesService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() fileData: Partial<FileEntity>) {
    return await this.filesService.update(id, fileData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.filesService.remove(id);
    return { message: 'File deleted successfully' };
  }
}
