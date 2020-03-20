// tslint:disable: max-line-length
import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import {env} from 'process';
import {HttpService} from '@nestjs/common';

@Injectable()
export class KeyPhraseUtilityService {

    constructor(
        private readonly http: HttpService,
        @Inject('winston') private readonly logger: Logger,
    ) {}

    hitKpRequest(data): object| Promise<object> {
        this.logger.info('hitting api for keyPhrase on url ' + env.DG_KEY_PHRASE_ENDPOINT);
        if (env.DG_KEY_PHRASE_ENDPOINT) {
            return this.http.post(env.DG_KEY_PHRASE_ENDPOINT, data).toPromise()
            .then(httpRes => {
                this.logger.info('recieved response from KPE API as ' + JSON.stringify(httpRes.data));
                if (httpRes.hasOwnProperty('status') && httpRes.status === 200) {
                    return Promise.resolve({ok: true, response: httpRes['data']});
                } else {
                    this.logger.error('Unexpected status code apart from 200 recorded in KPE --> ' + httpRes['status']);
                    return Promise.resolve({ok: false, error : 'unexpected status code from KeyPhrase Extraction API', status: 500, response: null});
                }
            }).catch(httpErr => {
                this.logger.info('An Error detected from KPE API');
                this.logger.error(httpErr);
                return Promise.resolve({ok: false, error: httpErr, status: 500});
            });
        } else {
            return {ok: false, status: 500, error: 'DID NOT DETECT DG_KEY_PHRASE_ENDPOINT'};
        }
    }

    /**
     * Initiates key phrase extraction. This function will first parse the data required for key phrase extraction api and then hit the api, 
     * send back appropriate response
     * @param data of Format from language translation api
     * @returns KeyPhrase combined result
     */
    initiateKeyPhraseExtraction(data) {
        return new Promise(async (resolve, reject) => {
            this.logger.info('data recieved to perform keyphrase extraction is ' + JSON.stringify(data));
            if (data) {
                const parsedData = this.parseDataForKPE(data);
                this.logger.info('parsed data for KPE looks like ' + JSON.stringify(parsedData));
                const response = await this.hitKpRequest(parsedData);
                if (response['ok']) {
                    // send back joined data object
                    const dataToSend = {
                        ...data,
                        key_phrase_extraction_result: response['response']['output'],
                    };
                    resolve({ok: true, data: dataToSend});
                } else {
                    const errorData = {
                        username: data['username'],
                        session_id: data['session_id'],
                        topic_name: data['topic_name'],
                    };
                    resolve({ok: false, status: 500, error: response['error'], data: errorData});
                }
            } else {
                resolve({ok: false, status: 400, error: 'data object sent for keyPhrase extraction seems invalid'});
            }
        });
    }

    parseDataForKPE(dataToParse) {
    return {data: [dataToParse['combined_transcript_en']]};
    }
}
