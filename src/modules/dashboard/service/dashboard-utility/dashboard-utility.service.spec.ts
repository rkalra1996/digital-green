import { Test, TestingModule } from '@nestjs/testing';
import { DashboardUtilityService } from './dashboard-utility.service';

describe('DashboardUtilityService', () => {
  let service: DashboardUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardUtilityService],
    }).compile();

    service = module.get<DashboardUtilityService>(DashboardUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
