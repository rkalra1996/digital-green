import { GoogleCloudWebhookHandlerService } from '../../services/google-cloud-webhook-handler/google-cloud-webhook-handler.service';
import { Logger } from 'winston';
export declare class WebhookController {
    private readonly logger;
    private readonly GCWehookSrvc;
    constructor(logger: Logger, GCWehookSrvc: GoogleCloudWebhookHandlerService);
    delegateWebhook(requestBody: any, params: any, response: any): Promise<any>;
}
