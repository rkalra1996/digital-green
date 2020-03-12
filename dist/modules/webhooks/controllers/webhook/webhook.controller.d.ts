import { GoogleCloudWebhookHandlerService } from '../../services/google-cloud-webhook-handler/google-cloud-webhook-handler.service';
export declare class WebhookController {
    private readonly GCWehookSrvc;
    constructor(GCWehookSrvc: GoogleCloudWebhookHandlerService);
    delegateWebhook(requestBody: any, params: any, response: any): Promise<any>;
}
