import { Controller, Post, Body, Param, Res } from '@nestjs/common';
import { GoogleCloudWebhookHandlerService } from '../../services/google-cloud-webhook-handler/google-cloud-webhook-handler.service';

@Controller('webhook')
export class WebhookController {

    constructor(private readonly GCWehookSrvc: GoogleCloudWebhookHandlerService) {}

    @Post('digital-green/:bucketName')
    async delegateWebhook(@Body() requestBody, @Param() params, @Res() response): Promise<any> {
        console.log('[WEBHOOK] /webhook/digital-green recieved');
        console.log(`${requestBody.bucket}/${requestBody.name}`);
        if (params.bucketName === 'google-cloud') {
            console.log('delegating to google-cloud handlers');
            this.GCWehookSrvc.handleWebhookEvent(requestBody)
            .then(handlerResponse => {
                console.log('Event has been updated in the database successfully');
            })
            .catch(handlerError => {
                console.log('An Error occured while updating the event in the database', handlerError);
            });
        }
        return response.status(200).send();
    }
}
