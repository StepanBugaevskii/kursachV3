import { Test, TestingModule } from '@nestjs/testing';
import { PeersGateway } from './peers.gateway';

describe('PeersGateway', () => {
  let gateway: PeersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PeersGateway],
    }).compile();

    gateway = module.get<PeersGateway>(PeersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
