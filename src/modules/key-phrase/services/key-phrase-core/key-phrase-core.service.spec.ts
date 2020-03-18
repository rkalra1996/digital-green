import { Test, TestingModule } from '@nestjs/testing';
import { KeyPhraseCoreService } from './key-phrase-core.service';

describe('KeyPhraseCoreService', () => {
  let service: KeyPhraseCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyPhraseCoreService],
    }).compile();

    service = module.get<KeyPhraseCoreService>(KeyPhraseCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
