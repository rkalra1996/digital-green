import { v1p1beta1 } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
export declare class GoogleCloudSdkService {
    private configPath;
    private projectID;
    private config;
    get getSpeechInstance(): v1p1beta1.SpeechClient;
    get getStorageInstance(): Storage;
    get getTranslationInstance(): import("@google-cloud/translate/build/src/v2").Translate;
}
