"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const webhook_controller_1 = require("./controllers/webhook/webhook.controller");
const google_cloud_webhook_handler_service_1 = require("./services/google-cloud-webhook-handler/google-cloud-webhook-handler.service");
const sessions_module_1 = require("../sessions/sessions.module");
const pipeline_module_1 = require("../pipeline/pipeline.module");
const shared_service_1 = require("./../../services/shared/shared.service");
const path_resolver_service_1 = require("./../../services/path-resolver/path-resolver.service");
let WebhooksModule = class WebhooksModule {
};
WebhooksModule = __decorate([
    common_1.Module({
        controllers: [webhook_controller_1.WebhookController],
        imports: [sessions_module_1.SessionsModule, pipeline_module_1.PipelineModule],
        providers: [path_resolver_service_1.PathResolverService, shared_service_1.SharedService, google_cloud_webhook_handler_service_1.GoogleCloudWebhookHandlerService],
    })
], WebhooksModule);
exports.WebhooksModule = WebhooksModule;
//# sourceMappingURL=webhooks.module.js.map