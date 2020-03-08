import { Test, TestingModule } from '@nestjs/testing';
import { UniversalLoggerService } from './universal-logger.service';

describe('UniversalLoggerService', () => {
  let service: UniversalLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UniversalLoggerService],
    }).compile();

    service = module.get<UniversalLoggerService>(UniversalLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
