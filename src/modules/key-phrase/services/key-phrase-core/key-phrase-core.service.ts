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
                const combinedText = data['combined_transcript_en'];
                this.logger.info('combined transcript read as ' + combinedText);
                const kpRes = await this.kpUtility.hitKpRequest({});
                if (kpRes['ok']) {
                    resolve(kpRes['data']);
                } else {
                    reject({ok: true, message: 'recieved response'});
                }
            } else {
                this.logger.info('combined_transcript_status detected as not DONE ---> ' + data['combined_transcript_status']);
                this.logger.info('sending ABORTION process');
                reject({ok: false, error: 'COMBINED_TRANSCRIPT STATUS DETECTED AS ' + data['combined_transcript_status'] + ', ABORTING THE PIPELINE'});
            }
        });
    }
}
