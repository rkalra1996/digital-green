import { SpeechToTextService } from '../speech-to-text/speech-to-text.service';
import { LanguageTranslationService } from '../language-translation/language-translation.service';
import { SentimentAnalysisService } from '../sentiment-analysis/sentiment-analysis.service';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
export declare class GcloudService {
    private readonly gcloudSDK;
    private readonly sttSrvc;
    private readonly ltSrvc;
    private readonly saSrvc;
    private _DEFAULT_BUCKET_NAME;
    private storage;
    constructor(gcloudSDK: GoogleCloudSdkService, sttSrvc: SpeechToTextService, ltSrvc: LanguageTranslationService, saSrvc: SentimentAnalysisService);
    uploadFilesToGCloud(parentFolderAddrObject: any, bucketName?: string, cloudFilePath?: string): Promise<any>;
    startSpeechToTextConversion(dataObj: any): Promise<object>;
    startLanguageTranslation(dataObj: any): Promise<object>;
    startSentimentAnalysis(): void;
}
