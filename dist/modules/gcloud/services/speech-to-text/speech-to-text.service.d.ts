import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
import { Logger } from 'winston';
export declare class SpeechToTextService {
    private readonly logger;
    private readonly googleSDK;
    private googleSpeech;
    constructor(logger: Logger, googleSDK: GoogleCloudSdkService);
    initiate(details: any): Promise<unknown>;
    getParsedResponse(response: any): string;
    cleanResult(data: any): any;
    cleanS2T(objectArrayToClean: any): any[];
    cleanAlternatives(alternativesArray: any): any[];
}
