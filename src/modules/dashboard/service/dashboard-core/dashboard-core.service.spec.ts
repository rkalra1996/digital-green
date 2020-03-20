import { Test, TestingModule } from '@nestjs/testing';
import { DashboardCoreService } from './dashboard-core.service';

describe('DashboardCoreService', () => {
  let service: DashboardCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardCoreService],
    }).compile();

    service = module.get<DashboardCoreService>(DashboardCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
