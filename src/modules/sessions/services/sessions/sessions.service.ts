import { Injectable } from '@nestjs/common';
import { SessionsUtilityService } from '../sessions-utility/sessions-utility.service';
import { UserUtilityService } from './../../../users/services/user-utility/user-utility.service';
import { SharedService } from './../../../../services/shared/shared.service';

@Injectable()
export class SessionsService {
    public GCLOUD_STORAGE = 'gcloud';
    public GCLOUD_BUCKET = 'app-blob-storage';

    constructor(
        private readonly sessionsUtilitySrvc: SessionsUtilityService,
        private readonly userUtilitySrvc: UserUtilityService,
        private readonly sharedSrvc: SharedService,
        ) {}

    /**
     * Gets user sessions
     * @param username
     * @returns list of sessions retrieved from the db
     */
    async getUserSessions(username: string) {
        if (username && typeof username === 'string') {
            // verify if the username is a validone
            const userExists = await this.userUtilitySrvc.userExists(username);
            if (typeof userExists === 'boolean') {
                if (userExists) {
                    // find user sessions
                const sessionsList = await this.sessionsUtilitySrvc.getSessionList(username);
                if (sessionsList) {
                    return {ok: true, status: 200, data: sessionsList};
                }
                return {ok: false, status: 500, error: 'An error occured while reading sessions for user ' + username};
                } else {
                    return {ok: false, status: 400, error: 'USER ' + username + ' DOES NOT EXISTS'};
                }
            }
        } else {
            return {ok: false, status: 400, error: 'USERNAME EMPTY'};
        }
    }

    /**
     * Creates user sessions
     * @param sessionData
     * @returns user sessions created with there status
     */
    async createUserSessions(sessionData: object): Promise<any> {
        // TODO: check if the user exists
        const userExists = await this.userUtilitySrvc.userExists(sessionData['username']);
        if (typeof userExists === 'boolean') {
            if (userExists) {
                // find user sessions
                const sessionsData = sessionData['sessions'].map(session => {
                    return {...session, username: sessionData['username']};
                });
                const sessionsCreated = await this.sessionsUtilitySrvc.createUserSessionsInBatch(sessionsData);
                if (sessionsCreated) {
                    return {ok: true, status: 200, data: sessionsCreated};
                }
                return {ok: false, status: 500, error: 'An error occured while creating new sessions for user ' + sessionData['username']};
                } else {
                    return {ok: false, status: 400, error: 'USER ' + sessionData['username'] + ' DOES NOT EXISTS'};
                }
            }
        }

        initiateUpload(sessionObject, cloudType= this.GCLOUD_STORAGE): Promise<any> {
            return new Promise(async (resolve, reject) => {
                if (cloudType === this.GCLOUD_STORAGE) {
                    console.log('initiating gcloud upload sequence\n');
                    // save the files in disk temporarely
                    const username = Object.keys(sessionObject)[0];
                    // const fileDataToSave = sessionObject
                    const fileDataObject = [];
                    sessionObject[username].topics.forEach(topic => {
                        fileDataObject.push({
                            filename: topic.fileData.originalname,
                            data: topic.fileData.buffer,
                        });
                    });
                    const filesSaved = await this.sharedSrvc.saveToTempStorage(`${username}/${sessionObject[username]['sessionid']}`, fileDataObject);
                    // filesSaved will have parentFolder path
                    if (filesSaved['ok']) {
                        resolve(true);
                        const isMonoConverted = await this.sessionsUtilitySrvc.convertTempFilesToMono(username, sessionObject[username]['sessionid']);
                        if (isMonoConverted['ok']) {
                            // send the saved path to uploader
                            this.sessionsUtilitySrvc.uploadFilesToCloudStorage(username, sessionObject[username]['sessionid'])
                            .then(uploadedToCloud => {
                                console.log('process uploading to gcloud triggered successfully', uploadedToCloud);
                            })
                            .catch(error => {
                                console.log('An Error occured while triggering upload to gcloud ', error);
                            });
                        }
                    } else {
                        reject(filesSaved['error']);
                    }
                }
            });
        }
}
