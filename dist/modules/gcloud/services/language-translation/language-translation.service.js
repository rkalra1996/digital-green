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
let LanguageTranslationService = class LanguageTranslationService {
    constructor(logger, gcloudSDK) {
        this.logger = logger;
        this.gcloudSDK = gcloudSDK;
        this.translator = this.gcloudSDK.getTranslationInstance;
    }
    updateTranslation(translationsPromises) {
        return Promise.all(translationsPromises)
            .then(allTranslationRes => {
            return allTranslationRes;
        })
            .catch(allTranslationErr => {
            this.logger.error('An error occured while capturing all translations for a particular audio');
            this.logger.error(allTranslationErr);
        });
    }
    cleanMergedData(dataToClean) {
        this.logger.info(`data recieved to clean is, ${JSON.stringify(dataToClean)}`);
        const cleanedData = [];
        dataToClean.forEach(translationObj => {
            const newTranslationObj = {
                alternatives: [],
                languageCode: '',
            };
            translationObj['alternatives'].forEach(altObj => {
                newTranslationObj.alternatives.push({ transcript: altObj.transcript, translation: altObj.translation, confidence: altObj.confidence });
            });
            newTranslationObj.languageCode = 'en-us';
            cleanedData.push(newTranslationObj);
        });
        this.logger.info(`cleaned data is  ${JSON.stringify(cleanedData)}`);
        return cleanedData;
    }
    getCombinedTranscriptEN(data) {
        const combinedEnTranslation = data.reduce((acc, currentObj) => {
            if (currentObj.hasOwnProperty('alternatives') && currentObj.alternatives.length > 0) {
                let collectedTranslation = '';
                currentObj.alternatives.forEach(altObj => {
                    if (altObj.hasOwnProperty('translation') && altObj.translation.length > 0) {
                        collectedTranslation += altObj.translation;
                    }
                });
                return acc + collectedTranslation;
            }
            else {
                return acc;
            }
        }, '');
        this.logger.info('combined en translation is ' + combinedEnTranslation);
        return combinedEnTranslation;
    }
    async initiate(detailsObj) {
        if (detailsObj.hasOwnProperty('speech_to_text_result')) {
            const originalTranscriptResult = detailsObj['speech_to_text_result'];
            const translatedpromise = await this.startTranslation(originalTranscriptResult);
            const transdata = await this.updateTranslation(translatedpromise);
            const mergedata = this.mergeTranslation(transdata, originalTranscriptResult);
            const cleanedData = this.cleanMergedData(mergedata);
            const combinedTranscriptEN = this.getCombinedTranscriptEN(cleanedData);
            detailsObj['translated_result'] = cleanedData;
            detailsObj['combined_transcript_en'] = combinedTranscriptEN;
            return { ok: true, data: detailsObj };
        }
        else {
            this.logger.info('looks like speech to text data is not present for translation, aborting the translate language sequence');
            return { ok: false, status: 500, error: 'Speech to Text Data is not present for language translation' };
        }
    }
    mergeTranslation(transdata, originalTranscriptResult) {
        const origdatawithtranslation = [];
        this.logger.info(`recieved transdata as , ${JSON.stringify(transdata)}`);
        originalTranscriptResult.forEach((originalObject, originalIndex) => {
            this.logger.info(`picking translation as  ${transdata[originalIndex][0]}`);
            originalObject['alternatives'][0]['translation'] = Array.isArray(transdata[originalIndex]) ? transdata[originalIndex][0] : transdata[originalIndex];
            this.logger.info(`assigned new object is  ${JSON.stringify(originalObject)}`);
            origdatawithtranslation.push(originalObject);
        });
        this.logger.info(`returning updated speech to text data as  ${origdatawithtranslation}`);
        return origdatawithtranslation;
    }
    startTranslation(speechToTextDataSet) {
        return new Promise((res, rej) => {
            this.logger.info('startTranslation ');
            this.logger.info(JSON.stringify(speechToTextDataSet));
            const translationsPromises = [];
            speechToTextDataSet.forEach((speechContent, originalIndex) => {
                if (speechContent.languageCode === 'en-us') {
                    translationsPromises.splice(originalIndex, 0, Promise.resolve(speechContent.alternatives[0].transcript));
                }
                else {
                    this.logger.info(`translating ', ${speechContent['alternatives'][0]['transcript']}`);
                    translationsPromises.splice(originalIndex, 0, this.translator.translate(speechContent['alternatives'][0]['transcript'], { to: 'en', model: 'nmt' }));
                }
            });
            return res(translationsPromises);
        });
    }
};
LanguageTranslationService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, google_cloud_sdk_service_1.GoogleCloudSdkService])
], LanguageTranslationService);
exports.LanguageTranslationService = LanguageTranslationService;
//# sourceMappingURL=language-translation.service.js.map