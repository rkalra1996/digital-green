import { Injectable } from '@nestjs/common';
import { v1p1beta1 } from '@google-cloud/speech';
import {Storage} from '@google-cloud/storage';
import * as path from 'path';

import {env as ENV} from 'process';

@Injectable()
export class GoogleCloudSdkService {
    private configPath = ENV.DG_GOOGLE_CLOUD_AUTH_PATH || '/home/rishabh34139/official_projects/configs/speaker-diarization-resource-53072b0e1c49.json';
    private projectID = ENV.DG_GOOGLE_PROJECT_ID || 'speaker-diarization-resource';
    private config = {
        keyFilename: path.resolve(this.configPath),
        projectId: this.projectID,
    };

    get getSpeechInstance() {
        return new v1p1beta1.SpeechClient(this.config);
    }

    get getStorageInstance() {
        return new Storage(this.config);
    }
}
