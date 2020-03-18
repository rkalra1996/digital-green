import { Test, TestingModule } from '@nestjs/testing';
import { KeyPhraseUtilityService } from './key-phrase-utility.service';

describe('KeyPhraseUtilityService', () => {
  let service: KeyPhraseUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyPhraseUtilityService],
    }).compile();

    service = module.get<KeyPhraseUtilityService>(KeyPhraseUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
