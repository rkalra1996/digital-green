import { Injectable } from '@nestjs/common';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { PipelineUtilityService } from '../pipeline-utility/pipeline-utility.service';

@Injectable()
export class PipelineCoreService {

    constructor(
        private readonly gcloudCore: GcloudService,
        private readonly pipelineUtility: PipelineUtilityService,
        ) {}

    /**
     * Initiates pipeline core service
     * @param initialData
     */
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
            this.pipelineUtility.updateSessionTopicInDB(s2tRes['data'], {
                speech_to_text_status: 'DONE',
                combined_transcript_status: 'DONE',
                speech_to_text_result: s2tRes['data']['speech_to_text_result'],
                combined_transcript: s2tRes['data']['transcript'],
            }).then(updated => {
                console.log('updated speech to text response in session db --> ', updated);
                this.gcloudCore.startLanguageTranslation({
                    speech_to_text_status: 'DONE',
                    combined_transcript_status: 'DONE' ,
                    ...s2tRes['data']})
                    .then(ltRes => {
                        console.log('recieved response from language translation sequence', JSON.stringify(ltRes));
                        this.pipelineUtility.updateSessionTopicInDB(ltRes['data'], {
                            language_translation_status: 'DONE',
                            translated_result: ltRes['data']['translated_result']
                        }).then(translationUpdated => {
                                console.log('updated language translation response in session DB ', translationUpdated);
                                console.log('pipeline finished successfully');
                            });
                    })
                    .catch(async ltErr => {
                        if (ltErr['status'] === 503) {
                            // process abortion error, halt the pipeline for this data
                            console.log(ltErr['error']);
                        } else {
                            // generic error
                            console.log('error detected in language translation sequence');
                            console.log(ltErr['error']);
                            const ErrStateupdated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                                username: ltErr['data']['username'],
                                session_id: ltErr['data']['session_id'],
                                topic_name: ltErr['data']['topic_name'],
                            }, {language_translation_status: 'FAILED'});
                            if (ErrStateupdated['ok']) {
                                console.log('failure status for speech to text has been updated successfully');
                            } else {
                                console.log(ErrStateupdated['error']);
                            }
                        }
                    });
            })
            .catch(failedUpdate => {
                console.log('error captured while updating in the database --> ', failedUpdate);
            });
        })
        .catch(async s2tErr => {
            console.log('error detected in speech to text sequence');
            console.log(s2tErr['error']);
            // update the sequence in db as well
            const updated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                username: initialData['username'],
                session_id: initialData['sessionID'],
                topic_name: initialData['topicName'],
            }, {speech_to_text_result_status: 'FAILED', combined_transcript_status: 'FAILED'});
            if (updated['ok']) {
                console.log('failure status for speech to text has been updated successfully');
            } else {
                console.log(updated['error']);
            }
        });
    }
}
