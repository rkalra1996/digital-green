import { Test, TestingModule } from '@nestjs/testing';
import { GcloudUtilityService } from './gcloud-utility.service';

describe('GcloudUtilityService', () => {
  let service: GcloudUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GcloudUtilityService],
    }).compile();

    service = module.get<GcloudUtilityService>(GcloudUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
