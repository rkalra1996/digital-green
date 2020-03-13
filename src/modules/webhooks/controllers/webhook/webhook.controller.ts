import { Controller, Post, Body, Param, Res, Inject } from '@nestjs/common';
import { GoogleCloudWebhookHandlerService } from '../../services/google-cloud-webhook-handler/google-cloud-webhook-handler.service';
import { Logger } from 'winston';

@Controller('webhook')
export class WebhookController {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly GCWehookSrvc: GoogleCloudWebhookHandlerService) {}

    @Post('digital-green/:bucketName')
    async delegateWebhook(@Body() requestBody, @Param() params, @Res() response): Promise<any> {
        this.logger.info('[WEBHOOK] /webhook/digital-green recieved');
        this.logger.info(`${requestBody.bucket}/${requestBody.name}`);
        if (params.bucketName === 'google-cloud') {
            this.logger.info('delegating to google-cloud handlers');
            this.GCWehookSrvc.handleWebhookEvent(requestBody)
            .then(handlerResponse => {
                this.logger.info('Event has been updated in the database successfully');
            })
            .catch(handlerError => {
                this.logger.info('An Error occured while updating the event in the database');
                this.logger.error(handlerError);
            });
        }
        return response.status(200).send();
    }
}
