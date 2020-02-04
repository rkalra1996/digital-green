import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type Session = any;

@Injectable()
export class SessionsUtilityService {
    constructor(@InjectModel('sessions') private readonly SessionModel: Model<Session>) {}

    /**
     * Gets session list
     * @description Internally calls findSessions by username method to gather sessions list from database
     * @param username
     * @returns null if an error occurs or a list of sessions matching username
     */
    async getSessionList(username: string) {
        return new Promise((resolve, reject) => {
            this.SessionModel.find({username}, (err, sessionList) => {
                if (err) {
                    console.log('Error while fetching sessions list for ', username);
                    console.log(err);
                    resolve(null);
                } else if (Array.isArray(sessionList)) {
                    resolve(sessionList);
                } else if (sessionList === null) {
                    // no results found
                    resolve([]);
                }
            });
        });
    }
}
