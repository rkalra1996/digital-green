import { Test, TestingModule } from '@nestjs/testing';
import { PathResolverService } from './path-resolver.service';

describe('PathResolverService', () => {
  let service: PathResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PathResolverService],
    }).compile();

    service = module.get<PathResolverService>(PathResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
