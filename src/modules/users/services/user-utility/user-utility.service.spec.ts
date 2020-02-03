import { Test, TestingModule } from '@nestjs/testing';
import { UserUtilityService } from './user-utility.service';

describe('UserUtilityService', () => {
  let service: UserUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserUtilityService],
    }).compile();

    service = module.get<UserUtilityService>(UserUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
