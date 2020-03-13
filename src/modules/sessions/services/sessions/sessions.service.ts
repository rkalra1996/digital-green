import { Injectable, Inject } from '@nestjs/common';
import { SessionsUtilityService } from '../sessions-utility/sessions-utility.service';
import { UserUtilityService } from './../../../users/services/user-utility/user-utility.service';
import { SharedService } from './../../../../services/shared/shared.service';

import {env as ENV} from 'process';
import { Logger } from 'winston';
@Injectable()
export class SessionsService {
    public GCLOUD_STORAGE = 'gcloud';
    public GCLOUD_BUCKET = ENV.DG_GOOGLE_APP_STORAGE;

    constructor(
        @Inject('winston') private readonly logger: Logger,
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

        /**
         * Initiates upload. An auto upload trigger which will upload the session files to cloud storage
         * @param sessionObject
         * @param [cloudType] (defaults to GCLOUD_STORAGE)
         * @returns Promise as soon as the file is saved locally and readyy for upload
         */
        initiateUpload(sessionObject, cloudType= this.GCLOUD_STORAGE): Promise<any> {
            return new Promise(async (resolve, reject) => {
                if (cloudType === this.GCLOUD_STORAGE) {
                    this.logger.info('initiating gcloud upload sequence\n');
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
                        this.logger.info('session object looks like ');
                        this.logger.info(JSON.stringify({
                            originalname: sessionObject[username]['topics'][0]['fileData']['originalname'],
                            encoding: sessionObject[username]['topics'][0]['fileData']['encoding'],
                            mimetype: sessionObject[username]['topics'][0]['fileData']['mimetype'],
                            size: sessionObject[username]['topics'][0]['fileData']['size']
                        }));
                        // tslint:disable-next-line: max-line-length
                        const isMonoConverted = await this.sessionsUtilitySrvc.convertTempFilesToMono(username, sessionObject[username]['sessionid'], sessionObject[username]['topics'][0]['name']);
                        if (isMonoConverted['ok']) {
                            // send the saved path to uploader
                            // send the file names to upload, at this point we are sure that files have been converted to mono
                            // so the file names would start from mono_
                            const monoFileNames = fileDataObject.map(fileObj => `mono_${fileObj.filename}`);
                            this.sessionsUtilitySrvc.uploadFilesToCloudStorage(
                                username,
                                sessionObject[username]['sessionid'],
                                undefined,
                                monoFileNames,
                                ).then(uploadedToCloud => {
                                    this.logger.info('process uploading to gcloud triggered successfully' + uploadedToCloud);
                            })
                            .catch(error => {
                                this.logger.info('An Error occured while triggering upload to gcloud ');
                                this.logger.error(error);
                            });
                        }
                    } else {
                        this.logger.info('error detected while saving files ');
                        this.logger.error(filesSaved['error']);
                        reject(filesSaved['error']);
                    }
                }
            });
        }

    /**
     * Gets user sessions status. The function will perform a session model lookup to give you the session list and its upload status on
     * bases of username provided
     * @param username
     * @returns session status object
     */
    async getUserSessionsStatus(username) {
        const sessionsData = await this.sessionsUtilitySrvc.getSessionsStatus(username);
        if (sessionsData['ok']) {
            const finalResponseObject = this.sessionsUtilitySrvc.formatObject(sessionsData as object);
            return {ok: true, data: finalResponseObject};
        } else {
            this.logger.info('returning back error from getUserSessionsStatus');
            this.logger.error(sessionsData['error']);
            return {ok: false, error: sessionsData['error']};
        }
    }
}
