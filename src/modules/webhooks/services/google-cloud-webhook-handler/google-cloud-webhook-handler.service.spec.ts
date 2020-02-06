import { Test, TestingModule } from '@nestjs/testing';
import { GoogleCloudWebhookHandlerService } from './google-cloud-webhook-handler.service';

describe('GoogleCloudWebhookHandlerService', () => {
  let service: GoogleCloudWebhookHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleCloudWebhookHandlerService],
    }).compile();

    service = module.get<GoogleCloudWebhookHandlerService>(GoogleCloudWebhookHandlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
