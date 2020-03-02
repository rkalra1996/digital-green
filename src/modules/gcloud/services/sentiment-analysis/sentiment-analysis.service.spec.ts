import { Test, TestingModule } from '@nestjs/testing';
import { SentimentAnalysisService } from './sentiment-analysis.service';

describe('SentimentAnalysisService', () => {
  let service: SentimentAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentimentAnalysisService],
    }).compile();

    service = module.get<SentimentAnalysisService>(SentimentAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
