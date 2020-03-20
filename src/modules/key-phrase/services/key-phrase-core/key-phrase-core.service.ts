// tslint:disable: max-line-length
import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { KeyPhraseUtilityService } from '../key-phrase-utility/key-phrase-utility.service';

@Injectable()
export class KeyPhraseCoreService {
    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly kpUtility: KeyPhraseUtilityService) {}

    startKeyPhraseExtraction(data): Promise<object> {
        this.logger.info('triggered keyphrase extraction');
        return new Promise(async (resolve, reject) => {
            this.logger.info(`recieved data in key phrase sequence as ${JSON.stringify(data)}`);
            if (data['combined_transcript_en_status'] === 'DONE') {
                const isExtracted = await this.kpUtility.initiateKeyPhraseExtraction(data);
                if (isExtracted['ok']) {
                    resolve({ok: true, data: isExtracted['data']});
                } else {
                    reject({ok: false, status: isExtracted['status'], error: isExtracted['error'], data: isExtracted['data']});
                }
            } else {
                this.logger.info('combined_transcript_status detected as not DONE ---> ' + data['combined_transcript_status']);
                this.logger.info('sending ABORTION process');
                const errorData = {
                    username: data['username'],
                    session_id: data['session_id'],
                    topic_name: data['topic_name'],
                };
                reject({ok: false, status: 503, data: errorData, error: 'COMBINED_TRANSCRIPT STATUS DETECTED AS ' + data['combined_transcript_status'] + ', ABORTING THE PIPELINE'});
            }
        });
    }
}
