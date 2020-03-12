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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const google_cloud_sdk_service_1 = require("../google-cloud-sdk/google-cloud-sdk.service");
let LanguageTranslationService = class LanguageTranslationService {
    constructor(gcloudSDK) {
        this.gcloudSDK = gcloudSDK;
        this.translator = this.gcloudSDK.getTranslationInstance;
    }
    updateTranslation(translationsPromises) {
        return Promise.all(translationsPromises)
            .then(allTranslationRes => {
            return allTranslationRes;
        })
            .catch(allTranslationErr => {
            console.log('An error occured while capturing all translations for a particular audio', allTranslationErr);
        });
    }
    cleanMergedData(dataToClean) {
        console.log('data recieved to clean is', dataToClean);
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
        console.log('cleaned data is ', JSON.stringify(cleanedData));
        return cleanedData;
    }
    async initiate(detailsObj) {
        if (detailsObj.hasOwnProperty('speech_to_text_result')) {
            const originalTranscriptResult = detailsObj['speech_to_text_result'];
            const translatedpromise = await this.startTranslation(originalTranscriptResult);
            const transdata = await this.updateTranslation(translatedpromise);
            const mergedata = this.mergeTranslation(transdata, originalTranscriptResult);
            const cleanedData = this.cleanMergedData(mergedata);
            detailsObj['translated_result'] = cleanedData;
            return { ok: true, data: detailsObj };
        }
        else {
            console.log('looks like speech to text data is not present for translation, aborting the translate language sequence');
            return { ok: false, status: 500, error: 'Speech to Text Data is not present for language translation' };
        }
    }
    mergeTranslation(transdata, originalTranscriptResult) {
        const origdatawithtranslation = [];
        console.log('recieved transdata as ', transdata);
        originalTranscriptResult.forEach((originalObject, originalIndex) => {
            console.log('picking translation as ', transdata[originalIndex][0]);
            originalObject['alternatives'][0]['translation'] = Array.isArray(transdata[originalIndex]) ? transdata[originalIndex][0] : transdata[originalIndex];
            console.log('assigned new object is ', originalObject);
            origdatawithtranslation.push(originalObject);
        });
        console.log('returning updated speech to text data as ', origdatawithtranslation);
        return origdatawithtranslation;
    }
    startTranslation(speechToTextDataSet) {
        return new Promise((res, rej) => {
            console.log('startTranslation ');
            console.log(JSON.stringify(speechToTextDataSet));
            const translationsPromises = [];
            speechToTextDataSet.forEach((speechContent, originalIndex) => {
                if (speechContent.languageCode === 'en-us') {
                    translationsPromises.splice(originalIndex, 0, Promise.resolve(speechContent.alternatives[0].transcript));
                }
                else {
                    console.log('translating ', speechContent['alternatives'][0]['transcript']);
                    translationsPromises.splice(originalIndex, 0, this.translator.translate(speechContent['alternatives'][0]['transcript'], { to: 'en', model: 'nmt' }));
                }
            });
            return res(translationsPromises);
        });
    }
};
LanguageTranslationService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [google_cloud_sdk_service_1.GoogleCloudSdkService])
], LanguageTranslationService);
exports.LanguageTranslationService = LanguageTranslationService;
//# sourceMappingURL=language-translation.service.js.map