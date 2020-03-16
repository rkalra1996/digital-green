import { Test, TestingModule } from '@nestjs/testing';
import { RolesCoreService } from './roles-core.service';

describe('RolesCoreService', () => {
  let service: RolesCoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesCoreService],
    }).compile();

    service = module.get<RolesCoreService>(RolesCoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
