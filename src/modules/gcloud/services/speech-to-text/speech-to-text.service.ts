import { Injectable } from '@nestjs/common';
import { GoogleCloudSdkService } from '../google-cloud-sdk/google-cloud-sdk.service';

@Injectable()
export class SpeechToTextService {

    private googleSpeech: any;
    constructor(private readonly googleSDK: GoogleCloudSdkService) {
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
                console.log('final result from speech to text gave ');
                console.log(JSON.stringify(finalRes[0].results));
                const speechToTextData = {...details};
                speechToTextData['speech_to_text_result'] = finalRes[0].results;
                speechToTextData['transcript'] = this.getParsedResponse(finalRes[0].results);
                res({ok: true, data: speechToTextData});
            })
            .catch(s2tErr => {
                console.log('An error occured while capturing result from speech to text', s2tErr);
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
}
