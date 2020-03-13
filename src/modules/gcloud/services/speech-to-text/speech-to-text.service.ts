import { Injectable, Inject } from '@nestjs/common';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';
import { Logger } from 'winston';

@Injectable()
export class SpeechToTextService {

    private googleSpeech: any;
    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly googleSDK: GoogleCloudSdkService) {
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
                // responses[0] is the operation object which will further resolve to final result
                return responses[0].promise();
            }).then(finalRes => {
                this.logger.info('final result from speech to text gave ');
                this.logger.info(JSON.stringify(finalRes[0].results));
                const speechToTextData = {...details};
                speechToTextData['speech_to_text_result'] = finalRes[0].results;
                speechToTextData['transcript'] = this.getParsedResponse(finalRes[0].results);
                res({ok: true, data: speechToTextData});
            })
            .catch(s2tErr => {
                this.logger.error('An error occured while capturing result from speech to text');
                this.logger.error(s2tErr);
                rej({ok: false, status: 500, error: 'An error occured while capturing result from speech to text'});
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
        return {...data, speech_to_text_result: cleanedS2T};
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
                newAlternatives.push({transcript: altObj.transcript, confidence: altObj.confidence});
                // console.log('pushed ', {transcript: altObj.transcript, confidence: altObj.confidence});
            });
            // console.log('sending new alternatives in s2t as ', newAlternatives);
            return newAlternatives;
        } else {
            this.logger.info('new alternatives array is either empty or invalid array, returning empty array instead');
            return [];
        }
    }
}
