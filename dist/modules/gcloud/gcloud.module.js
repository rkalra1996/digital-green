"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const gcloud_service_1 = require("./services/gcloud/gcloud.service");
const gcloud_utility_service_1 = require("./services/gcloud-utility/gcloud-utility.service");
const speech_to_text_service_1 = require("./services/speech-to-text/speech-to-text.service");
const language_translation_service_1 = require("./services/language-translation/language-translation.service");
const sentiment_analysis_service_1 = require("./services/sentiment-analysis/sentiment-analysis.service");
const google_cloud_sdk_service_1 = require("./services/google-cloud-sdk/google-cloud-sdk.service");
let GcloudModule = class GcloudModule {
};
GcloudModule = __decorate([
    common_1.Module({
        providers: [
            gcloud_service_1.GcloudService, gcloud_utility_service_1.GcloudUtilityService,
            speech_to_text_service_1.SpeechToTextService, language_translation_service_1.LanguageTranslationService,
            sentiment_analysis_service_1.SentimentAnalysisService, google_cloud_sdk_service_1.GoogleCloudSdkService,
        ],
        exports: [gcloud_service_1.GcloudService, gcloud_utility_service_1.GcloudUtilityService, speech_to_text_service_1.SpeechToTextService, language_translation_service_1.LanguageTranslationService, sentiment_analysis_service_1.SentimentAnalysisService, google_cloud_sdk_service_1.GoogleCloudSdkService],
    })
], GcloudModule);
exports.GcloudModule = GcloudModule;
//# sourceMappingURL=gcloud.module.js.map