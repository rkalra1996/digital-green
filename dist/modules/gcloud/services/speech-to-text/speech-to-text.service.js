"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const google_cloud_sdk_service_1 = require("../google-cloud-sdk/google-cloud-sdk.service");
let SpeechToTextService = class SpeechToTextService {
    constructor(logger, googleSDK) {
        this.logger = logger;
        this.googleSDK = googleSDK;
        this.googleSpeech = this.googleSDK.getSpeechInstance;
    }
    initiate(details) {
        return new Promise((res, rej) => {
            const request = {
                audio: {
                    uri: details.gsURI,
                },
                config: {
                    encoding: 'LINEAR16',
                    languageCode: 'en-US',
                    model: 'default',
                    alternativeLanguageCodes: ['hi-IN'],
                    enableAutomaticPunctuation: true,
                },
            };
            this.googleSpeech.longRunningRecognize(request)
                .then(responses => {
                return responses[0].promise();
            }).then(finalRes => {
                this.logger.info('final result from speech to text gave ');
                this.logger.info(JSON.stringify(finalRes[0].results));
                const speechToTextData = Object.assign({}, details);
                speechToTextData['speech_to_text_result'] = finalRes[0].results;
                speechToTextData['transcript'] = this.getParsedResponse(finalRes[0].results);
                res({ ok: true, data: speechToTextData });
            })
                .catch(s2tErr => {
                this.logger.error('An error occured while capturing result from speech to text');
                this.logger.error(s2tErr);
                rej({ ok: false, status: 500, error: 'An error occured while capturing result from speech to text' });
            });
        });
    }
    getParsedResponse(response) {
        const combinedS2T = [];
        response.forEach(result => {
            if (result.hasOwnProperty('alternatives') && result.alternatives.length > 0) {
                combinedS2T.push(result.alternatives[0].transcript);
            }
        });
        return combinedS2T.join('');
    }
    cleanResult(data) {
        const cleanedS2T = this.cleanS2T(data['speech_to_text_result']);
        return Object.assign(Object.assign({}, data), { speech_to_text_result: cleanedS2T });
    }
    cleanS2T(objectArrayToClean) {
        const cleanedArray = [];
        objectArrayToClean.forEach(dataObj => {
            const newObj = {
                alternatives: this.cleanAlternatives(dataObj['alternatives']),
                languageCode: dataObj['languageCode'],
            };
            cleanedArray.push(newObj);
        });
        return cleanedArray;
    }
    cleanAlternatives(alternativesArray) {
        if (Array.isArray(alternativesArray) && alternativesArray.length > 0) {
            const newAlternatives = [];
            alternativesArray.forEach(altObj => {
                newAlternatives.push({ transcript: altObj.transcript, confidence: altObj.confidence });
            });
            return newAlternatives;
        }
        else {
            this.logger.info('new alternatives array is either empty or invalid array, returning empty array instead');
            return [];
        }
    }
};
SpeechToTextService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, google_cloud_sdk_service_1.GoogleCloudSdkService])
], SpeechToTextService);
exports.SpeechToTextService = SpeechToTextService;
//# sourceMappingURL=speech-to-text.service.js.map