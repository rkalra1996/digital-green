"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const pipeline_core_service_1 = require("./services/pipeline-core/pipeline-core.service");
const gcloud_module_1 = require("../gcloud/gcloud.module");
const pipeline_utility_service_1 = require("./services/pipeline-utility/pipeline-utility.service");
const mongoose_1 = require("@nestjs/mongoose");
const sessions_schema_1 = require("../sessions/schemas/sessions.schema");
const key_phrase_module_1 = require("../key-phrase/key-phrase.module");
let PipelineModule = class PipelineModule {
};
PipelineModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'sessions', schema: sessions_schema_1.SessionSchema }]),
            gcloud_module_1.GcloudModule, key_phrase_module_1.KeyPhraseModule
        ],
        providers: [pipeline_core_service_1.PipelineCoreService, pipeline_utility_service_1.PipelineUtilityService],
        exports: [pipeline_core_service_1.PipelineCoreService],
    })
], PipelineModule);
exports.PipelineModule = PipelineModule;
//# sourceMappingURL=pipeline.module.js.map