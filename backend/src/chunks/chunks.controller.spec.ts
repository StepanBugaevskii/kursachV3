import { Test, TestingModule } from '@nestjs/testing';
import { ChunksController } from './chunks.controller';

describe('ChunksController', () => {
  let controller: ChunksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChunksController],
    }).compile();

    controller = module.get<ChunksController>(ChunksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
