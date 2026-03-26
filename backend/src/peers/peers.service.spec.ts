import { Test, TestingModule } from '@nestjs/testing';
import { PeersService } from './peers.service';

describe('PeersService', () => {
  let service: PeersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeersService],
    }).compile();

    service = module.get<PeersService>(PeersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
