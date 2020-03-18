// tslint:disable: max-line-length
import { Injectable, Inject } from '@nestjs/common';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
import { Logger } from 'winston';

@Injectable()
export class LanguageTranslationService {

    private translator;

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly gcloudSDK: GoogleCloudSdkService) {
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
                newTranslationObj.alternatives.push({transcript: altObj.transcript, translation: altObj.translation, confidence: altObj.confidence});
            });
            newTranslationObj.languageCode = 'en-us';
            cleanedData.push(newTranslationObj);
        });
        this.logger.info(`cleaned data is  ${JSON.stringify(cleanedData)}`);
        return cleanedData;
    }

    /**
     * Gets combined transcript en. This function will combine all the english translations into a single combined transcript.
     * @param data
     * @returns String
     */
    getCombinedTranscriptEN(data): string {
        const combinedEnTranslation = data.reduce((acc, currentObj) => {
            if (currentObj.hasOwnProperty('alternatives') && currentObj.alternatives.length > 0) {
                let collectedTranslation = '';
                currentObj.alternatives.forEach(altObj => {
                    if (altObj.hasOwnProperty('translation') && altObj.translation.length > 0) {
                        collectedTranslation += altObj.translation;
                    }
                });
                return acc + collectedTranslation;
            } else {
                return acc;
            }
        }, '');
        this.logger.info('combined en translation is ' + combinedEnTranslation);
        return combinedEnTranslation;
    }

    async initiate(detailsObj) {
        // get the transcrip result and translate it accordingly
        if (detailsObj.hasOwnProperty('speech_to_text_result')) {
            const originalTranscriptResult = detailsObj['speech_to_text_result'];
            const translatedpromise = await this.startTranslation(originalTranscriptResult);
            const transdata = await this.updateTranslation(translatedpromise);
            const mergedata =  this.mergeTranslation(transdata, originalTranscriptResult);
            const cleanedData = this.cleanMergedData(mergedata);
            const combinedTranscriptEN = this.getCombinedTranscriptEN(cleanedData);
            // merge this data with detailsObj and send it back
            detailsObj['translated_result'] = cleanedData;
            detailsObj['combined_transcript_en'] = combinedTranscriptEN;
            return {ok: true, data: detailsObj};
        } else {
            this.logger.info('looks like speech to text data is not present for translation, aborting the translate language sequence');
            return {ok: false, status: 500, error: 'Speech to Text Data is not present for language translation'};
        }
    }
    mergeTranslation(transdata, originalTranscriptResult: any) {
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
                    // if language code is english, don't send it for translation
                    // speechToTextDataSet[originalIndex]['alternatives'][0]['translation'] = speechContent.alternatives[0].transcript;
                    translationsPromises.splice(
                        originalIndex,
                        0,
                        Promise.resolve(speechContent.alternatives[0].transcript));
                } else {
                    this.logger.info(`translating ', ${speechContent['alternatives'][0]['transcript']}`);
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
