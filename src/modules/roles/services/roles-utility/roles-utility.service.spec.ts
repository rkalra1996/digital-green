import { Test, TestingModule } from '@nestjs/testing';
import { RolesUtilityService } from './roles-utility.service';

describe('RolesUtilityService', () => {
  let service: RolesUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesUtilityService],
    }).compile();

    service = module.get<RolesUtilityService>(RolesUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
