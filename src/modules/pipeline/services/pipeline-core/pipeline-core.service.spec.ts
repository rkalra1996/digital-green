import { Test, TestingModule } from '@nestjs/testing';
import { PipelineCoreService } from './pipeline-core.service';

describe('PipelineCoreService', () => {
  let service: PipelineCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineCoreService],
    }).compile();

    service = module.get<PipelineCoreService>(PipelineCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
