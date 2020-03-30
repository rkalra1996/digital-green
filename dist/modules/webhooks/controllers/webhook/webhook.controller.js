"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const google_cloud_webhook_handler_service_1 = require("../../services/google-cloud-webhook-handler/google-cloud-webhook-handler.service");
let WebhookController = class WebhookController {
    constructor(logger, GCWehookSrvc) {
        this.logger = logger;
        this.GCWehookSrvc = GCWehookSrvc;
    }
    async delegateWebhook(requestBody, params, response) {
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
};
__decorate([
    common_1.Post('digital-green/:bucketName'),
    __param(0, common_1.Body()), __param(1, common_1.Param()), __param(2, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "delegateWebhook", null);
WebhookController = __decorate([
    common_1.Controller('webhook'),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, google_cloud_webhook_handler_service_1.GoogleCloudWebhookHandlerService])
], WebhookController);
exports.WebhookController = WebhookController;
//# sourceMappingURL=webhook.controller.js.map