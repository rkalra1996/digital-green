import { Test, TestingModule } from '@nestjs/testing';
import { SessionsUtilityService } from './sessions-utility.service';

describe('SessionsUtilityService', () => {
  let service: SessionsUtilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SessionsUtilityService],
    }).compile();

    service = module.get<SessionsUtilityService>(SessionsUtilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
