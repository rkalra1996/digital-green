"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const gcloud_service_1 = require("./../../../gcloud/services/gcloud/gcloud.service");
const pipeline_utility_service_1 = require("../pipeline-utility/pipeline-utility.service");
const key_phrase_core_service_1 = require("../../../key-phrase/services/key-phrase-core/key-phrase-core.service");
let PipelineCoreService = class PipelineCoreService {
    constructor(logger, gcloudCore, keyPhraseCore, pipelineUtility) {
        this.logger = logger;
        this.gcloudCore = gcloudCore;
        this.keyPhraseCore = keyPhraseCore;
        this.pipelineUtility = pipelineUtility;
    }
    initiate(initialData) {
        this.logger.info('pipeline sequence started');
        this.gcloudCore
            .startSpeechToTextConversion({ username: initialData['username'], gsURI: initialData['gsURI'],
            session_id: initialData['sessionID'], topic_name: initialData['topicName'] })
            .then(s2tRes => {
            this.logger.info(`recieved response from s2t sequence ', ${JSON.stringify(s2tRes)}`);
            this.pipelineUtility.updateSessionTopicInDB(s2tRes['data'], {
                speech_to_text_status: 'DONE',
                combined_transcript_status: 'DONE',
                speech_to_text_result: s2tRes['data']['speech_to_text_result'],
                combined_transcript: s2tRes['data']['transcript'],
            }).then(updated => {
                this.logger.info(`updated speech to text response in session db --> ', ${JSON.stringify(updated)}`);
                this.gcloudCore.startLanguageTranslation(Object.assign({ speech_to_text_status: 'DONE', combined_transcript_status: 'DONE' }, s2tRes['data']))
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
                        this.keyPhraseCore.startKeyPhraseExtraction(Object.assign({ language_translation_status: 'DONE', combined_transcript_en_status: 'DONE' }, ltRes['data']))
                            .then(kpRes => {
                            this.logger.info(`recieved response from keyPhrase extraction as ${JSON.stringify(kpRes)}`);
                            const kpUpdationObject = {
                                key_phrase_extraction_status: 'DONE',
                                key_phrase_extraction_result: kpRes['data']['key_phrase_extraction_result'],
                            };
                            this.pipelineUtility.updateSessionTopicInDB(kpRes['data'], kpUpdationObject)
                                .then(kpUpdateSucess => {
                                this.logger.info('key phrase extraction result has been updated in database successfully -> ' + kpUpdateSucess);
                                this.logger.info('pipeline finished successfully');
                            })
                                .catch(kpUpdateErr => {
                                this.logger.error('An error occured while updating data for KPE in the database');
                                this.logger.error(kpUpdateErr);
                            });
                        })
                            .catch(async (kpErr) => {
                            if (kpErr['status'] === 503) {
                                this.logger.error(kpErr['error']);
                                const ErrStateupdated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                                    username: kpErr['data']['username'],
                                    session_id: kpErr['data']['session_id'],
                                    topic_name: kpErr['data']['topic_name'],
                                }, { key_phrase_extraction_status: 'ABORTED' });
                                if (ErrStateupdated['ok']) {
                                    this.logger.info('abort status for key phrase extraction has been updated successfully');
                                }
                                else {
                                    this.logger.error(ErrStateupdated['error']);
                                }
                            }
                            else {
                                this.logger.info('error detected in key Phrase Extraction sequence');
                                this.logger.error(kpErr['error']);
                                const ErrStateupdated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                                    username: kpErr['data']['username'],
                                    session_id: kpErr['data']['session_id'],
                                    topic_name: kpErr['data']['topic_name'],
                                }, { key_phrase_extraction_status: 'FAILED' });
                                if (ErrStateupdated['ok']) {
                                    this.logger.info('failure status for key phrase extraction has been updated successfully');
                                }
                                else {
                                    this.logger.error(ErrStateupdated['error']);
                                }
                            }
                        });
                    });
                })
                    .catch(async (ltErr) => {
                    if (ltErr['status'] === 503) {
                        this.logger.error(ltErr['error']);
                    }
                    else {
                        this.logger.info('error detected in language translation sequence');
                        this.logger.error(ltErr['error']);
                        const ErrStateupdated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                            username: ltErr['data']['username'],
                            session_id: ltErr['data']['session_id'],
                            topic_name: ltErr['data']['topic_name'],
                        }, { language_translation_status: 'FAILED' });
                        if (ErrStateupdated['ok']) {
                            this.logger.info('failure status for speech to text has been updated successfully');
                        }
                        else {
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
            .catch(async (s2tErr) => {
            this.logger.info('error detected in speech to text sequence');
            this.logger.error(s2tErr['error']);
            const updated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                username: initialData['username'],
                session_id: initialData['sessionID'],
                topic_name: initialData['topicName'],
            }, { speech_to_text_result_status: 'FAILED', combined_transcript_status: 'FAILED' });
            if (updated['ok']) {
                this.logger.info('failure status for speech to text has been updated successfully');
            }
            else {
                this.logger.error(updated['error']);
            }
        });
    }
};
PipelineCoreService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, gcloud_service_1.GcloudService,
        key_phrase_core_service_1.KeyPhraseCoreService,
        pipeline_utility_service_1.PipelineUtilityService])
], PipelineCoreService);
exports.PipelineCoreService = PipelineCoreService;
//# sourceMappingURL=pipeline-core.service.js.map