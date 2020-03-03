// tslint:disable: max-line-length
import { Injectable } from '@nestjs/common';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
import { networkInterfaces } from 'os';

@Injectable()
export class LanguageTranslationService {

    private translator;

    constructor(private readonly gcloudSDK: GoogleCloudSdkService) {
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
                newTranslationObj.alternatives.push({transcript: altObj.transcript, translation: altObj.translation, confidence: altObj.confidence});
            });
            newTranslationObj.languageCode = 'en-us';
            cleanedData.push(newTranslationObj);
        });
        console.log('cleaned data is ', JSON.stringify(cleanedData));
        return cleanedData;
    }

    async initiate(detailsObj) {
        // get the transcrip result and translate it accordingly
        if (detailsObj.hasOwnProperty('speech_to_text_result')) {
            const originalTranscriptResult = detailsObj['speech_to_text_result'];
            const translatedpromise = await this.startTranslation(originalTranscriptResult);
            const transdata = await this.updateTranslation(translatedpromise);
            const mergedata =  this.mergeTranslation(transdata, originalTranscriptResult);
            const cleanedData = this.cleanMergedData(mergedata);
            // merge this data with detailsObj and send it back
            detailsObj['translated_result'] = cleanedData;
            return {ok: true, data: detailsObj};
        } else {
            console.log('looks like speech to text data is not present for translation, aborting the translate language sequence');
            return {ok: false, status: 500, error: 'Speech to Text Data is not present for language translation'};
        }
    }
    mergeTranslation(transdata, originalTranscriptResult: any) {
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
                    // if language code is english, don't send it for translation
                    // speechToTextDataSet[originalIndex]['alternatives'][0]['translation'] = speechContent.alternatives[0].transcript;
                    translationsPromises.splice(
                        originalIndex,
                        0,
                        Promise.resolve(speechContent.alternatives[0].transcript));
                } else {
                    console.log('translating ', speechContent['alternatives'][0]['transcript']);
                    // send for translation
                    translationsPromises.splice(
                        originalIndex,
                        0,
                        this.translator.translate(speechContent['alternatives'][0]['transcript'], {to: 'en', model: 'nmt'}));
                }
            });
            return res(translationsPromises);
        });
    }
}
