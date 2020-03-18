import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class KeyPhraseUtilityService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
    ) {}

    hitKpRequest({}): Promise<object> {
        this.logger.info('hitting api for keyPhrase');
        return new Promise((resolve, reject) => {
            this.logger.info('returning response from hitAPI');
            resolve({ok: true, data: {}});
        });
    }
}
