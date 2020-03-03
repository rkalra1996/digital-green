import { Injectable } from '@nestjs/common';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';

@Injectable()
export class PipelineCoreService {

    constructor(
        private readonly gcloudCore: GcloudService) {}

    initiate(initialData) {
        console.log('pipeline sequence started');
        // step 1 : hit the speech to text api using session_id, topic_id and gcloudURI
        this.gcloudCore
        .startSpeechToTextConversion({ username: initialData['username'], gsURI: initialData['gsURI'],
        session_id: initialData['sessionID'], topic_name: initialData['topicName']})
        .then(s2tRes => {
            console.log('recieved response from s2t sequence ', s2tRes);
            // start language translation sequence
            this.gcloudCore.startLanguageTranslation(s2tRes['data'])
            .then(ltRes => {
                console.log('recieved response from language translation sequence', JSON.stringify(ltRes));
                console.log('pipeline finished successfully');
            })
            .catch(ltErr => {
                console.log('error detected in language translation sequence');
                console.log(ltErr['error']);
            });
        })
        .catch(s2tErr => {
            console.log('error detected in speech to text sequence');
            console.log(s2tErr['error']);
        });
    }
}
