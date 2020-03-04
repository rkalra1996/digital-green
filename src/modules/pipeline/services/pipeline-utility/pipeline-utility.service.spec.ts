import { Test, TestingModule } from '@nestjs/testing';
import { PipelineUtilityService } from './pipeline-utility.service';

describe('PipelineUtilityService', () => {
  let service: PipelineUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipelineUtilityService],
    }).compile();

    service = module.get<PipelineUtilityService>(PipelineUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
