import { Injectable, Inject } from '@nestjs/common';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { PipelineUtilityService } from '../pipeline-utility/pipeline-utility.service';
import { Logger } from 'winston';
import { KeyPhraseCoreService } from 'src/modules/key-phrase/services/key-phrase-core/key-phrase-core.service';

@Injectable()
export class PipelineCoreService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly gcloudCore: GcloudService,
        private readonly keyPhraseCore: KeyPhraseCoreService,
        private readonly pipelineUtility: PipelineUtilityService,
        ) {}

    /**
     * Initiates pipeline core service
     * @param initialData
     */
    initiate(initialData) {
        this.logger.info('pipeline sequence started');
        // step 1 : hit the speech to text api using session_id, topic_id and gcloudURI
        this.gcloudCore
        .startSpeechToTextConversion({ username: initialData['username'], gsURI: initialData['gsURI'],
        session_id: initialData['sessionID'], topic_name: initialData['topicName']})
        .then(s2tRes => {
            this.logger.info(`recieved response from s2t sequence ', ${JSON.stringify(s2tRes)}`);
            // start language translation sequence
            // update the speech to text data in database
            this.pipelineUtility.updateSessionTopicInDB(s2tRes['data'], {
                speech_to_text_status: 'DONE',
                combined_transcript_status: 'DONE',
                speech_to_text_result: s2tRes['data']['speech_to_text_result'],
                combined_transcript: s2tRes['data']['transcript'],
            }).then(updated => {
                this.logger.info(`updated speech to text response in session db --> ', ${JSON.stringify(updated)}`);
                this.gcloudCore.startLanguageTranslation({
                    speech_to_text_status: 'DONE',
                    combined_transcript_status: 'DONE',
                    ...s2tRes['data']})
                    .then(ltRes => {
                        this.logger.info(`recieved response from language translation sequence', ${JSON.stringify(ltRes)}`);
                        const updationObject = {
                            language_translation_status: 'DONE',
                            combined_transcript_en_status: 'DONE',
                            translated_result: ltRes['data']['translated_result'],
                            combined_transcript_en: ltRes['data']['combined_transcript_en'],
                        };
                        this.logger.info('updation object to send in database for language translation success is ' + JSON.stringify(updationObject));
                        this.pipelineUtility.updateSessionTopicInDB(ltRes['data'], updationObject).then(translationUpdated => {
                                this.logger.info(`updated language translation response in session DB ', ${translationUpdated}`);
                                this.logger.info('triggering keyPhrase extraction pieline sequence');
                                this.keyPhraseCore.startKeyPhraseExtraction(
                                    {   language_translation_status: 'DONE',
                                        combined_transcript_en_status: 'DONE',
                                        ...ltRes['data'],
                                    })
                                .then(kpRes => {
                                    this.logger.info(`recieved response from keyPhrase extraction as ${JSON.stringify(kpRes)}`);
                                    this.logger.info('pipeline finished successfully');
                                })
                                .catch(kpErr => {
                                    this.logger.error('recieved error from keyphrase extraction');
                                    this.logger.error(kpErr);
                                });
                            });
                    })
                    .catch(async ltErr => {
                        if (ltErr['status'] === 503) {
                            // process abortion error, halt the pipeline for this data
                            this.logger.error(ltErr['error']);
                        } else {
                            // generic error
                            this.logger.info('error detected in language translation sequence');
                            this.logger.error(ltErr['error']);
                            const ErrStateupdated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                                username: ltErr['data']['username'],
                                session_id: ltErr['data']['session_id'],
                                topic_name: ltErr['data']['topic_name'],
                            }, {language_translation_status: 'FAILED'});
                            if (ErrStateupdated['ok']) {
                                this.logger.info('failure status for speech to text has been updated successfully');
                            } else {
                                this.logger.error(ErrStateupdated['error']);
                            }
                        }
                    });
            })
            .catch(failedUpdate => {
                this.logger.info('error captured while updating in the database --> ');
                this.logger.error(failedUpdate);
            });
        })
        .catch(async s2tErr => {
            this.logger.info('error detected in speech to text sequence');
            this.logger.error(s2tErr['error']);
            // update the sequence in db as well
            const updated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                username: initialData['username'],
                session_id: initialData['sessionID'],
                topic_name: initialData['topicName'],
            }, {speech_to_text_result_status: 'FAILED', combined_transcript_status: 'FAILED'});
            if (updated['ok']) {
                this.logger.info('failure status for speech to text has been updated successfully');
            } else {
                this.logger.error(updated['error']);
            }
        });
    }
}
