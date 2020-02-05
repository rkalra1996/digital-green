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
            this.SessionModel.find({username}).sort('-created') // sort with most recent created sessions
            .then(sessionList => {
                if (Array.isArray(sessionList)) {
                    resolve(sessionList);
                } else if (sessionList === null) {
                    // no results found
                    resolve([]);
                }
            }).catch(err => {
                console.log('Error while fetching sessions list for ', username);
                console.log(err);
                resolve(null);
            });
        });
    }

    validateSessionObject(sessionData): boolean {
        if (
            !sessionData ||
            sessionData.constructor !== Object ||
            Object.keys(sessionData).length === 0 ||
            (
                !sessionData.hasOwnProperty('name') ||
                !sessionData.hasOwnProperty('created') ||
                !sessionData.hasOwnProperty('session_id') ||
                !sessionData.hasOwnProperty('isUploaded')
                )
            ) {
                return false;
            } else {
                return true;
            }
    }

    async validateSessionBody(body: object): Promise<object> {
        if (body && body.constructor === Object) {
            if (Object.keys(body).length > 0) {
                if (body.hasOwnProperty('username') && typeof body['username'] === 'string' && body['username'].length) {
                    if (body.hasOwnProperty('sessions') && Array.isArray(body['sessions'])) {
                        if (body['sessions'].length > 0) {
                            let notValid;
                            for (let index = 0 ; index < body['sessions'].length ; ++index ) {
                                if (!this.validateSessionObject(body['sessions'][index])) {
                                    notValid = {ok: false, error: 'sessions object at index ' + index + ' seems invalid'};
                                    break;
                                }
                            }
                            if (notValid) {
                                return notValid;
                            } else {
                                return {ok: true};
                            }
                        } else {
                            return {ok: false, error: 'sessions array is empty'};
                        }
                    } else {
                        return {ok: false, error: 'either sessions key is missing or it is not an array'};
                    }
                } else {
                    return {ok: false, error: 'username key at the root level is mandatory'};
                }
            } else {
                return {ok: false, error: 'body should not be an empty object'};
            }
        } else {
            return {ok: false, error: 'body is not an object'};
        }
    }

    async createUserSessionsInBatch(sessions) {
        return new Promise((resolve, reject) => {
            console.log('inserting ', sessions);
            this.SessionModel.insertMany([...sessions])
            .then(isInserted => {
                console.log('inserted ', isInserted);
                resolve(isInserted);
            })
            .catch(insertErr => {
                console.log('insert Error', insertErr);
                resolve(null);
            });
        });
    }
}
