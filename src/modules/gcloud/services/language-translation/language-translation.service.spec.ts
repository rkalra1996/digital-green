import { Test, TestingModule } from '@nestjs/testing';
import { LanguageTranslationService } from './language-translation.service';

describe('LanguageTranslationService', () => {
  let service: LanguageTranslationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LanguageTranslationService],
    }).compile();

    service = module.get<LanguageTranslationService>(LanguageTranslationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
