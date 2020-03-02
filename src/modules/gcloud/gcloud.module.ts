import { Module } from '@nestjs/common';
import { GcloudService } from './services/gcloud/gcloud.service';
import { GcloudUtilityService } from './services/gcloud-utility/gcloud-utility.service';
import { SpeechToTextService } from './services/speech-to-text/speech-to-text.service';
import { LanguageTranslationService } from './services/language-translation/language-translation.service';
import { SentimentAnalysisService } from './services/sentiment-analysis/sentiment-analysis.service';
import { GoogleCloudSdkService } from './services/google-cloud-sdk/google-cloud-sdk.service';

@Module({
    providers: [
        GcloudService, GcloudUtilityService,
        SpeechToTextService, LanguageTranslationService,
        SentimentAnalysisService, GoogleCloudSdkService,
    ],
    exports: [GcloudService, GcloudUtilityService, SpeechToTextService, LanguageTranslationService, SentimentAnalysisService, GoogleCloudSdkService],
})
export class GcloudModule {}
