import { Test, TestingModule } from '@nestjs/testing';
import { PeersController } from './peers.controller';

describe('PeersController', () => {
  let controller: PeersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeersController],
    }).compile();

    controller = module.get<PeersController>(PeersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
