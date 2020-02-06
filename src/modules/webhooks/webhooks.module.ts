import { Module } from '@nestjs/common';
import { WebhookController } from './controllers/webhook/webhook.controller';
import { GoogleCloudWebhookHandlerService } from './services/google-cloud-webhook-handler/google-cloud-webhook-handler.service';
import { SessionsModule } from '../sessions/sessions.module';

@Module({
    controllers: [WebhookController],
    imports: [SessionsModule],
    providers: [GoogleCloudWebhookHandlerService],
})
export class WebhooksModule {}
