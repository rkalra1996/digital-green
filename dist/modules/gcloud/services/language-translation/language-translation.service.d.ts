import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
export declare class LanguageTranslationService {
    private readonly gcloudSDK;
    private translator;
    constructor(gcloudSDK: GoogleCloudSdkService);
    updateTranslation(translationsPromises: any): Promise<void | [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]>;
    cleanMergedData(dataToClean: any): any[];
    initiate(detailsObj: any): Promise<{
        ok: boolean;
        data: any;
        status?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        status: number;
        error: string;
        data?: undefined;
    }>;
    mergeTranslation(transdata: any, originalTranscriptResult: any): any[];
    startTranslation(speechToTextDataSet: any): Promise<unknown>;
}
