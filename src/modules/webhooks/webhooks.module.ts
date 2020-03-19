import { Module } from '@nestjs/common';
import { WebhookController } from './controllers/webhook/webhook.controller';
import { GoogleCloudWebhookHandlerService } from './services/google-cloud-webhook-handler/google-cloud-webhook-handler.service';
import { SessionsModule } from '../sessions/sessions.module';
import {PipelineModule} from '../pipeline/pipeline.module';
import { SharedService } from './../../services/shared/shared.service';
import { PathResolverService } from './../../services/path-resolver/path-resolver.service';

@Module({
    controllers: [WebhookController],
    imports: [SessionsModule, PipelineModule],
    providers: [PathResolverService, SharedService, GoogleCloudWebhookHandlerService],
})
export class WebhooksModule {}
