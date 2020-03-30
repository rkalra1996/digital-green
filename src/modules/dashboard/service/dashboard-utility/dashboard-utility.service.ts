// tslint:disable: jsdoc-format
import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';

@Injectable()
export class DashboardUtilityService {
    constructor(
        @Inject('winston') private readonly logger: Logger,
    ) { }

    sessionsCompletedTillDate(data) {
        let completed = 0;
        let incomplete = 0;
        data.forEach(session => {
            if (session['isUploaded']) {
                completed += 1;
            } else {
                incomplete += 1;
            }
        });
        return { completed, incomplete };
    }

    sessionsWithNoQuestionsRecorded(data) {
        return data.reduce((noTopicsCount, session) => {
            return noTopicsCount + (session['topics'] && session['topics'].length > 0) ? 0 : 1;
        }, 0);
    }

    getUserInfoFromDetails(userArray, username) {
        return userArray.find(user => user.username === username);
    }

    pipelineFailureInfo(data, userDetails?: object[]) {
        const userInfo = {};
        const userDetailsMap = new Map();
        data.forEach(session => {
            if (!Object.keys(userInfo).includes(session['username'])) {
                userInfo[session['username']] = [];
                userDetailsMap.set(session['username'], this.getUserInfoFromDetails(userDetails['data'], session['username']));
            }
            const sessionAnalysisObj = {
                session_name: session['name'],
                session_created_by: userDetailsMap.get(session['username'])['name'] || '',
                session_id: session['session_id'],
                session_created_at: new Date(session['created']).toLocaleString(),
                session_is_uploaded: session['isUploaded'],
                pipeline: {
                    total_questions_allotted: session['topics_limit'],
                    total_questions_recorded: session['topics'].length,
                    pipeline_completed_count: 0,
                    pipeline_completed_details: [],
                    pipeline_failed_count: 0,
                    pipeline_failure_details: [],

                },
            };
            const questionAnalysisData = this.getTopicAnalysis(session['topics'], userDetailsMap.get(session['username']));
            sessionAnalysisObj.pipeline.pipeline_completed_count = questionAnalysisData['pipeline_completed_count'];
            sessionAnalysisObj.pipeline.pipeline_failed_count = questionAnalysisData['pipeline_failed_count'];
            sessionAnalysisObj.pipeline.pipeline_completed_details = questionAnalysisData['pipeline_completed_details'];
            sessionAnalysisObj.pipeline.pipeline_failure_details = questionAnalysisData['pipeline_failure_details'];
            userInfo[session['username']].push(sessionAnalysisObj);
        });
        return userInfo;
    }

    getQuestionText(questionId, roleData) {
        return roleData.questions.find(question => question['question_id'] === questionId).question_text;
    }

    getTopicAnalysis(topicsArray, userRoleInfo) {
        let pipelineCompletedCount = 0;
        let pipelineFailedCount = 0;
        const pipelineCompletedDetails = [];
        const pipelineFailureDetails = [];

        topicsArray.forEach(topic => {
            let selectedBlock = 'pipelineCompletedDetails';
            const questionObj = {
                question_name: topic['topic_name'],
                question_recorded_by: userRoleInfo['name'] || '',
                question_id: topic['topic_id'],
                question_text: this.getQuestionText(topic['topic_id'], userRoleInfo),
                question_uploaded: topic['isUploaded'],
                question_recording_uri: topic['file_data']['mediaURI'],
                question_recording_uploaded_on: new Date(topic['file_data']['uploadedOn']).toLocaleString(),
                question_recording_modified_on: new Date(topic['file_data']['modifiedOn']).toLocaleString(),
                question_recording_size: topic['file_data']['mediasize'],
            };
            if (topic.hasOwnProperty('speech_to_text_status')) {
                if (topic.speech_to_text_status === 'DONE') {
                    questionObj['speech_to_text_status'] = 'DONE',
                    questionObj['speech_to_text_transcript'] = topic['combined_transcript'];
                } else {
                    questionObj['speech_to_text_status'] = 'FAILED',
                    questionObj['speech_to_text_transcript'] = 'Not Available';
                    // this topic shall go to the failure details
                    selectedBlock = 'pipelineFailureDetails';
                }
            }
            if (topic.hasOwnProperty('language_translation_status')) {
                if (topic['language_translation_status'] === 'DONE') {
                    questionObj['language_translation_status'] = 'DONE';
                    questionObj['translated_data'] = this.getCombinedEnTranscript(topic['translated_result']);
                } else {
                    questionObj['language_translation_status'] = 'FAILED';
                    questionObj['translated_data'] = null;
                    selectedBlock = 'pipelineFailureDetails';
                }
            }
            if (topic.hasOwnProperty('key_phrase_extraction_status')) {
                if (topic.key_phrase_extraction_status === 'DONE') {
                    questionObj['key_phrase_extraction_status'] = 'DONE';
                    questionObj['key_phrase_data'] = topic['key_phrase_extraction_result'];
                } else {
                    questionObj['key_phrase_extraction_status'] = topic['key_phrase_extraction_status'] || 'FAILED';
                    questionObj['key_phrase_data'] = null;
                    selectedBlock = 'pipelineFailureDetails';
                }
            }
            // decide if it is a success or failed pipeline
            if (selectedBlock === 'pipelineCompletedDetails') {
                pipelineCompletedCount += 1;
                pipelineCompletedDetails.push(questionObj);
            } else {
                pipelineFailedCount += 1;
                pipelineFailureDetails.push(questionObj);
            }
        });
        return {
            pipeline_completed_count: pipelineCompletedCount,
            pipeline_failed_count: pipelineFailedCount,
            pipeline_completed_details: pipelineCompletedDetails,
            pipeline_failure_details: pipelineFailureDetails,
        };
    }

    getCombinedEnTranscript(data): string {
        const combinedEnTranslation = data.reduce((acc, currentObj) => {
            if (currentObj.hasOwnProperty('alternatives') && currentObj.alternatives.length > 0) {
                let collectedTranslation = '';
                currentObj.alternatives.forEach(altObj => {
                    if (altObj.hasOwnProperty('translation') && altObj.translation.length > 0) {
                        collectedTranslation += altObj.translation;
                    }
                });
                return acc + collectedTranslation;
            } else {
                return acc;
            }
        }, '');
        // this.logger.info('combined en translation is ' + combinedEnTranslation);
        return combinedEnTranslation;
    }

    parseQueryParamsForDate(data) {
        this.logger.info(`Query params recieved are ${JSON.stringify(data)}`);
        const dateObj = {
            from: '',
            to: '',
        };
        if (data.hasOwnProperty('from')) {
            dateObj.from = new Date(data.from).toISOString();
        } else {
            // empty string means all the data unitl "to" date
            dateObj.from = '';
        }
        if (data.hasOwnProperty('to')) {
            dateObj.to = new Date(data.to).toISOString();
        } else {
            dateObj.to = new Date().toISOString();
        }
        this.logger.info(`Date object looks like ${JSON.stringify(dateObj)}`);
        return dateObj;
    }

    mergeSessionsInfoWithUsers(sessionDetails, userDetails) {
        return this.pipelineFailureInfo(sessionDetails, userDetails);
    }
}
