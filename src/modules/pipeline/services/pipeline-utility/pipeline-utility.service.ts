import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Logger } from 'winston';

export type Session = any;

@Injectable()
export class PipelineUtilityService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        @InjectModel('sessions') private readonly SessionModel: Model<Session>,
    ) {}

    /**
     * Updates specific session topic in db. This function is specifically used to update the pipeline responses in the database
     * @param userInfoObj
     * @param dataToAdd
     * @returns Promise<boolean (true) | string (error)>
     */
    updateSessionTopicInDB(userInfoObj, dataToAdd): Promise<boolean | string> {
        return new Promise((res, rej) => {
            if (userInfoObj['session_id'] && userInfoObj['username'] && userInfoObj['topic_name']) {
                this.logger.info(`saving data for session id ', ${userInfoObj['session_id']}`);
                this.SessionModel.findOne({username: userInfoObj['username'], session_id: userInfoObj['session_id']}).then(data => {
                    const selectedTopicIdx = data['topics'].findIndex(topic => topic['topic_name'] === userInfoObj['topic_name']);
                    if (selectedTopicIdx > -1) {
                        const newTopic = {...data['topics'][selectedTopicIdx], ...dataToAdd};
                        data['topics'][selectedTopicIdx] = newTopic;
                        this.SessionModel.updateOne({session_id: userInfoObj['session_id']}, {topics : data['topics']})
                        .then(updateRes => {
                            this.logger.info(`update res , ${JSON.stringify(updateRes)}`);
                            res(true);
                        })
                        .catch(updateErr => {
                            this.logger.info('update Error into the database');
                            this.logger.error(updateErr);
                            rej('An error occured while saving the updated topic details');
                        });
                    } else {
                        this.logger.error('did not find the topic which needs to be updated');
                    }
                }).catch(findErr => {
                    this.logger.info('error while getting topics using session id ');
                    this.logger.error(findErr);
                    rej('An error occured while finding topic using the session id');
                });
            } else {
                this.logger.error('session id not available inside user object while updating in sessionDB');
                rej('session id not available inside user object while updating in sessionDB');
            }
        });
    }

    updateSessionTopicStatusFailure(userObj, dataToAdd): Promise<object> {
        return new Promise((res, rej) => {
            this.updateSessionTopicInDB(userObj, dataToAdd)
            .then(updated => {
                res({ok: updated});
            })
            .catch(updateErr => {
                res({ok: false, error: updateErr});
            });
        });
    }
}
