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
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const gcloud_service_1 = require("./../../../gcloud/services/gcloud/gcloud.service");
const pipeline_utility_service_1 = require("../pipeline-utility/pipeline-utility.service");
let PipelineCoreService = class PipelineCoreService {
    constructor(gcloudCore, pipelineUtility) {
        this.gcloudCore = gcloudCore;
        this.pipelineUtility = pipelineUtility;
    }
    initiate(initialData) {
        console.log('pipeline sequence started');
        this.gcloudCore
            .startSpeechToTextConversion({ username: initialData['username'], gsURI: initialData['gsURI'],
            session_id: initialData['sessionID'], topic_name: initialData['topicName'] })
            .then(s2tRes => {
            console.log('recieved response from s2t sequence ', s2tRes);
            this.pipelineUtility.updateSessionTopicInDB(s2tRes['data'], {
                speech_to_text_status: 'DONE',
                combined_transcript_status: 'DONE',
                speech_to_text_result: s2tRes['data']['speech_to_text_result'],
                combined_transcript: s2tRes['data']['transcript'],
            }).then(updated => {
                console.log('updated speech to text response in session db --> ', updated);
                this.gcloudCore.startLanguageTranslation(Object.assign({ speech_to_text_status: 'DONE', combined_transcript_status: 'DONE' }, s2tRes['data']))
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
                    .catch(async (ltErr) => {
                    if (ltErr['status'] === 503) {
                        console.log(ltErr['error']);
                    }
                    else {
                        console.log('error detected in language translation sequence');
                        console.log(ltErr['error']);
                        const ErrStateupdated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                            username: ltErr['data']['username'],
                            session_id: ltErr['data']['session_id'],
                            topic_name: ltErr['data']['topic_name'],
                        }, { language_translation_status: 'FAILED' });
                        if (ErrStateupdated['ok']) {
                            console.log('failure status for speech to text has been updated successfully');
                        }
                        else {
                            console.log(ErrStateupdated['error']);
                        }
                    }
                });
            })
                .catch(failedUpdate => {
                console.log('error captured while updating in the database --> ', failedUpdate);
            });
        })
            .catch(async (s2tErr) => {
            console.log('error detected in speech to text sequence');
            console.log(s2tErr['error']);
            const updated = await this.pipelineUtility.updateSessionTopicStatusFailure({
                username: initialData['username'],
                session_id: initialData['sessionID'],
                topic_name: initialData['topicName'],
            }, { speech_to_text_result_status: 'FAILED', combined_transcript_status: 'FAILED' });
            if (updated['ok']) {
                console.log('failure status for speech to text has been updated successfully');
            }
            else {
                console.log(updated['error']);
            }
        });
    }
};
PipelineCoreService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [gcloud_service_1.GcloudService,
        pipeline_utility_service_1.PipelineUtilityService])
], PipelineCoreService);
exports.PipelineCoreService = PipelineCoreService;
//# sourceMappingURL=pipeline-core.service.js.map