import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudSdkService } from './google-cloud-sdk.service';

describe('GoogleCloudSdkService', () => {
  let service: GoogleCloudSdkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCloudSdkService],
    }).compile();

    service = module.get<GoogleCloudSdkService>(GoogleCloudSdkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
