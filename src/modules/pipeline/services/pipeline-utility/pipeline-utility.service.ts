import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type Session = any;

@Injectable()
export class PipelineUtilityService {

    constructor(
        @InjectModel('sessions') private readonly SessionModel: Model<Session>,
    ) {}

    /**
     * Updates session in db. This function is specifically used to update the pipeline responses in the database
     * @param userInfoObj
     * @param dataToAdd
     * @returns Promise<boolean (true) | string (error)>
     */
    updateSessionInDB(userInfoObj, dataToAdd) {
        return new Promise((res, rej) => {
            const sessionId = userInfoObj['session_id'] || null;
            if (sessionId) {
                console.log('saving data for session id ', sessionId);
                this.SessionModel.findOne({session_id: sessionId}).then(data => {
                    const selectedTopicIdx = data['topics'].findIndex(topic => topic['topic_name'] === userInfoObj['topic_name']);
                    if (selectedTopicIdx > -1) {
                        const newTopic = {...data['topics'][selectedTopicIdx], ...dataToAdd};
                        data['topics'][selectedTopicIdx] = newTopic;
                        this.SessionModel.updateOne({session_id: sessionId}, {topics : data['topics']})
                        .then(updateRes => {
                            console.log('update res ', updateRes);
                            res(true);
                        })
                        .catch(updateErr => {
                            console.log('update Error', updateErr);
                            rej('An error occured while saving the updated topic details');
                        });
                    } else {
                        console.log('did not find the topic which needs to be updated');
                    }
                }).catch(findErr => {
                    console.log('error while getting topics using session id ', findErr);
                    rej('An error occured while finding topic using the session id');
                });
            } else {
                rej('session id not available inside user object while updating in sessionDB');
            }
        });
    }
}
