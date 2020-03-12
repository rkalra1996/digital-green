"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const speech_1 = require("@google-cloud/speech");
const storage_1 = require("@google-cloud/storage");
const translate_1 = require("@google-cloud/translate");
const path = require("path");
const process_1 = require("process");
let GoogleCloudSdkService = class GoogleCloudSdkService {
    constructor() {
        this.configPath = process_1.env.DG_GOOGLE_CLOUD_AUTH_PATH || '/home/rishabh34139/official_projects/configs/speaker-diarization-resource-53072b0e1c49.json';
        this.projectID = process_1.env.DG_GOOGLE_PROJECT_ID || 'speaker-diarization-resource';
        this.config = {
            keyFilename: path.resolve(this.configPath),
            projectId: this.projectID,
        };
    }
    get getSpeechInstance() {
        return new speech_1.v1p1beta1.SpeechClient(this.config);
    }
    get getStorageInstance() {
        return new storage_1.Storage(this.config);
    }
    get getTranslationInstance() {
        return new translate_1.default.v2.Translate(this.config);
    }
};
GoogleCloudSdkService = __decorate([
    common_1.Injectable()
], GoogleCloudSdkService);
exports.GoogleCloudSdkService = GoogleCloudSdkService;
//# sourceMappingURL=google-cloud-sdk.service.js.map