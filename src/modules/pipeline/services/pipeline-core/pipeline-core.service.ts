import { Injectable } from '@nestjs/common';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { PipelineUtilityService } from '../pipeline-utility/pipeline-utility.service';

@Injectable()
export class PipelineCoreService {

    constructor(
        private readonly gcloudCore: GcloudService,
        private readonly pipelineUtility: PipelineUtilityService,
        ) {}

    initiate(initialData) {
        console.log('pipeline sequence started');
        // step 1 : hit the speech to text api using session_id, topic_id and gcloudURI
        this.gcloudCore
        .startSpeechToTextConversion({ username: initialData['username'], gsURI: initialData['gsURI'],
        session_id: initialData['sessionID'], topic_name: initialData['topicName']})
        .then(s2tRes => {
            console.log('recieved response from s2t sequence ', s2tRes);
            // start language translation sequence
            // update the speech to text data in database
            this.pipelineUtility.updateSessionInDB(s2tRes['data'], {
                speech_to_text_result: s2tRes['data']['speech_to_text_result'],
                combined_transcript: s2tRes['data']['transcript'],
            }).then(updated => {
                console.log('updated speech to text response in session db --> ', updated);
                this.gcloudCore.startLanguageTranslation(s2tRes['data'])
                    .then(ltRes => {
                        console.log('recieved response from language translation sequence', JSON.stringify(ltRes));
                        console.log('pipeline finished successfully');
                        this.pipelineUtility.updateSessionInDB(ltRes['data'], {translated_result: ltRes['data']['translated_result']})
                            .then(translationUpdated => {
                                console.log('updated language translation response in session DB ', translationUpdated);
                            });
                    })
                    .catch(ltErr => {
                        console.log('error detected in language translation sequence');
                        console.log(ltErr['error']);
                    });
            })
            .catch(failedUpdate => {
                console.log('error captured while updating in the database --> ', failedUpdate);
            });
        })
        .catch(s2tErr => {
            console.log('error detected in speech to text sequence');
            console.log(s2tErr['error']);
        });
    }
}
