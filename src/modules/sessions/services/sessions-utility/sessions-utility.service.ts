import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PathResolverService } from 'src/services/path-resolver/path-resolver.service';
import {resolve} from 'path';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { FfmpegUtilityService } from '../../../../services/ffmpeg-utility/ffmpeg-utility.service';
import { UserUtilityService } from '../../../users/services/user-utility/user-utility.service';
import { Logger } from 'winston';

export type Session = any;

@Injectable()
export class SessionsUtilityService {
    constructor(
        @Inject('winston') private readonly logger: Logger,
        @InjectModel('sessions') private readonly SessionModel: Model<Session>,
        private readonly pathResolver: PathResolverService,
        private readonly gcloudSrvc: GcloudService,
        private readonly ffmpeg: FfmpegUtilityService,
        private readonly userUtilitySrvc: UserUtilityService,
        ) {}

    /**
     * Gets session list
     * @description Internally calls findSessions by username method to gather sessions list from database
     * @param [username]
     * @returns null if an error occurs or a list of sessions matching username
     */
    async getSessionList(username?: string, dateFilterObj?: object) {
        return new Promise((resolve, reject) => {
            const query = this.getSessionQuery(dateFilterObj, username);
            this.SessionModel.find(query).sort('-created') // sort with most recent created sessions
            .then(sessionList => {
                if (Array.isArray(sessionList)) {
                    resolve(sessionList);
                } else if (sessionList === null) {
                    // no results found
                    resolve([]);
                }
            }).catch(err => {
                this.logger.error('Error while fetching sessions list for ');
                this.logger.error(err);
                resolve(null);
            });
        });
    }

    getSessionQuery(dateFilterObj: object, username?: string) {
        let q = username ? {username} : {};
        if (dateFilterObj) {
            if (dateFilterObj['from']) {
                q['created'] = {"$gte": new Date(dateFilterObj['from']), "$lte": new Date(dateFilterObj['to'])};
            } else {
                q['created'] = {"$lte": new Date(dateFilterObj['to'])};
            }
        } else {
            this.logger.info('no date filter object supplied, will not use it either');
        }
        this.logger.info('final query created as ' + JSON.stringify(q));
        return q;
    }

    /**
     * Validates session object
     * @param sessionData
     * @returns true if session object validates properly
     */
    validateSessionObject(sessionData): boolean {
        if (
            !sessionData ||
            sessionData.constructor !== Object ||
            Object.keys(sessionData).length === 0 ||
            (
                !sessionData.hasOwnProperty('name') ||
                !sessionData.hasOwnProperty('created') ||
                !sessionData.hasOwnProperty('session_id') ||
                !sessionData.hasOwnProperty('isUploaded') ||
                !sessionData.hasOwnProperty('topics_limit')
                )
            ) {
                return false;
            } else {
                return true;
            }
    }

    /**
     * Validates session body provided in the request
     * @param body
     * @returns object having ok key set to true if body is validated else ok is set to false with specific error in error key
     */
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

    /**
     * Creates user sessions in batch. This function creates a new session / sessions in database.
     * [NOTE] : For simplicity, the function currently performs single session insert at a time
     * @param sessions Array (currently one session object in the array)
     * @returns session object that has been created
     */
    async createUserSessionsInBatch(sessions) {
        return new Promise((resolve, reject) => {
            this.logger.info(`inserting ', ${JSON.stringify(sessions)}`);
            if (sessions.length > 1) {
                this.logger.info('cannot insert more than one sessions at a time');
                resolve({ok: false, error: 'Multiple sessions sent for insert'});
            } else {
                // read the session first, if it exists, ignore else create
                const sessionToInsert = sessions[0];
                this.logger.info(`session to insert is ', ${JSON.stringify(sessionToInsert)}`);
                this.SessionModel.find({session_id: sessionToInsert.session_id})
                .then(sessionRead => {
                    this.logger.info(`session read is ', ${JSON.stringify(sessionRead)}`);
                    if (Array.isArray(sessionRead) && sessionRead.length < 1) {
                        // no session id exists, creating new one
                        this.logger.info(`No such session already present for ', ${sessionToInsert.session_id}`);
                        // no such session found, insert it
                        this.SessionModel.create({...sessionToInsert})
                        .then(sessionCreated => {
                            this.logger.info(`session created ', ${JSON.stringify(sessionCreated)}`);
                            resolve(sessionCreated);
                        })
                        .catch(creationError => {
                            this.logger.error('Error while creating a new session ');
                            this.logger.error(creationError);
                            resolve(null);
                        });
                    } else {
                        this.logger.info('unexpected session read response ');
                        this.logger.info(sessionRead);
                        this.logger.info(`session already exists, won't create a new one`);
                        resolve({ok: true, message: `session already exists, won't create a new one`});
                    }
                })
                .catch(sessionReadErr => {
                    this.logger.info('error while reading an existing session');
                    this.logger.error(sessionReadErr);
                    resolve(null);
                });
            }
        });
    }

    /**
     * Gets session details from db and bucket details accordingly
     * @param files
     * @returns object containing session details
     */
        getSessionDetailsObject(files) {
            const sessionDetailsObject = {};
            return new Promise((resolve, reject) => {
                try {
                    files.forEach(file => {
                        const info = file.originalname.split('_');
                        // storing username
                        const [username, sessionid, topicName] = info;
                        // const username = info[0];
                        // const sessionid = info[1];
                        const topicname = topicName.split('.wav')[0];
                        if (sessionDetailsObject.hasOwnProperty(username)) {
                            // append to the user object
                            const fileObj = {...file};
                            fileObj['filename'] = fileObj.originalname.split('.wav')[0];
                            sessionDetailsObject[username]['topics'].push({name: topicname, fileData: fileObj});
                        } else {
                            // new username
                            sessionDetailsObject[username] = {};
                            // storing session id
                            sessionDetailsObject[username]['sessionid'] = sessionid;
                            // storing topic name
                            sessionDetailsObject[username]['topics'] = [];
                            const fileObj = {...file};
                            fileObj['filename'] = fileObj.originalname.split('.wav')[0];
                            sessionDetailsObject[username]['topics'].push({name: topicname, fileData: fileObj});
                        }
                    });
                    resolve(sessionDetailsObject);
                } catch (e) {
                    this.logger.info('An error occured while creating session details object ');
                    this.logger.error(e);
                    resolve(null);
                }
            });
        }

    /**
     * Uploads files to cloud storage. This is the core function which uploads the files to the google cloud storage
     * @param username
     * @param sessionID
     * @param [parentSourceAddress] If you provide parent folder address and not filenames, it will upload all the files from the parent folder
     * @param [fileNames] If you provide filenames along with parentSourceAddress, it will upload those specific files from the parent folder
     * @returns  Pending promise which contains the trigger to cloud
     */
    uploadFilesToCloudStorage(username, sessionID, parentSourceAddress?: string, fileNames?: any[]) {
        if (!parentSourceAddress) {
            parentSourceAddress = resolve(this.pathResolver.paths.TEMP_STORE_PATH);
            this.logger.info('to upload files from ', `${username}/${sessionID}/mono inside ` + parentSourceAddress);
        } else {
            this.logger.info('to upload files from ' + `${parentSourceAddress}`);
        }
        let addressObject = {};
        if (Array.isArray(fileNames) && fileNames.length > 0) {
            this.logger.info(`joining file names ', ${JSON.stringify(fileNames)}`);
            addressObject = {
            filePaths: fileNames.map(fileName => resolve(parentSourceAddress,username,sessionID, 'mono', fileName)),
            };
            this.logger.info(`object looks like', ${addressObject}`);
        } else {
            addressObject = {
            parentFolderName: username,
            parentFolderAddress: resolve(parentSourceAddress, username),
            filesParentFolderAddr : `${sessionID}/mono`,
            };
        }
        const cloudDestinationDir = `${username}/${sessionID}`;
        // because we don't want to upload inside mono folder.
        return this.gcloudSrvc.uploadFilesToGCloud(addressObject, undefined, cloudDestinationDir);
    }

    /**
     * Converts temp files to mono. The driver function which trigger ffmpeg for converting the files to mono
     * @param username
     * @param sessionID
     * @param topicID
     * @returns  Promise<object>
     */
    convertTempFilesToMono(username, sessionID, topicID) {
        return new Promise((monoResolve, monoReject) => {
            const parentFolderAddr = resolve(this.pathResolver.paths.TEMP_STORE_PATH, username, sessionID);
            this.logger.info('parent folder to pick files for mono conversion is ' + parentFolderAddr);
            // start mono conversion
            const fileName = `${username}_${sessionID}_${topicID}.wav`;
            this.ffmpeg.convertStereo2Mono(parentFolderAddr, fileName , () => {
                this.logger.info('conversion to mono done');
                monoResolve({ok: true});
            });
        });
    }

    /**
     * Updates session file status. This function is responsible for updating the session db using the details provided.
     * @param sessionFileObject
     * @returns Promise<object>
     */
    updateSessionFileStatus(sessionFileObject): Promise<any> {
        this.logger.info('updating session file status in database');
        return new Promise(async (sessionFileResolve, sessionFileReject) => {
            // check if user exists
            if (await this.userUtilitySrvc.userExists(sessionFileObject.username)) {
                // check if session is already created
                this.getSessionBySessionID(sessionFileObject.username, sessionFileObject.sessionID)
                .then(fetchedSession => {
                    this.logger.info('fetched session from database is ');
                    this.logger.info(JSON.stringify(fetchedSession));
                    const newTopicsArray = [...fetchedSession.topics];
                    // add the file status to the session
                    const existingTopicIndex = newTopicsArray.findIndex(topic => topic.topic_name === sessionFileObject.topicName);
                    if (existingTopicIndex > -1) {
                        this.logger.info('updating topic');
                        // update the topic
                        newTopicsArray[existingTopicIndex]['file_data']['bucketname'] = sessionFileObject.bucketname;
                        newTopicsArray[existingTopicIndex]['file_data']['filename'] = sessionFileObject.filename;
                        newTopicsArray[existingTopicIndex]['file_data']['mediaURI'] = sessionFileObject.gsURI;
                        newTopicsArray[existingTopicIndex]['file_data']['uploadedOn'] = sessionFileObject.uploadedOn;
                        newTopicsArray[existingTopicIndex]['file_data']['modifiedOn'] = sessionFileObject.modifiedOn;
                        newTopicsArray[existingTopicIndex]['file_data']['mediasize'] = sessionFileObject.mediaSize;
                        newTopicsArray[existingTopicIndex]['file_data']['ismono'] = true;
                        // setting it true for now, then rechecking it later
                        newTopicsArray[existingTopicIndex]['isUploaded'] = true;
                    } else {
                        this.logger.info('new topic');
                        // new topic entry
                        newTopicsArray.push({
                            topic_name: sessionFileObject.topicName,
                            topic_id: sessionFileObject.topicName,
                            isUploaded: true,
                            file_data: {
                                bucketname: sessionFileObject.bucketname,
                                mediaURI: sessionFileObject.gsURI,
                                filename: sessionFileObject.filename,
                                uploadedOn: sessionFileObject.uploadedOn,
                                modifiedOn: sessionFileObject.modifiedOn,
                                mediasize: sessionFileObject.mediaSize,
                                ismono: true,
                            },
                        });
                    }
                    // verify if all the topics are updated
                    let allUploaded = false;
                    if (newTopicsArray.length === fetchedSession['topics_limit']) {
                        if (!newTopicsArray.filter(topic => topic.isUploaded === false).length) {
                            // all topics have there files, set global uploaded status to true
                            this.logger.info('detected all topics having there respective cloud files');
                            allUploaded = true;
                        }
                    }
                    // all data has been modified
                    this.logger.info('final updation object"s topics looks like ');
                    this.logger.info(JSON.stringify(newTopicsArray));
                    this.SessionModel.updateOne(
                        {
                        username: sessionFileObject.username,
                        session_id: sessionFileObject.sessionID}
                        , {
                            isUploaded: allUploaded !== fetchedSession.isUploaded ? allUploaded : fetchedSession.isUploaded,
                            topics: [...newTopicsArray],
                        },
                        ).then(updatedDoc => {
                            this.logger.info('updated doc now looks like ');
                            this.logger.info(JSON.stringify(updatedDoc));
                            sessionFileResolve({ok: true, data: sessionFileObject});
                        }).catch(updationError => {
                            this.logger.error(updationError);
                            sessionFileReject({ok: false, error: 'An Error occured while updating the database document'});
                        });
                })
                .catch(sessionFetchError => {
                    this.logger.error(sessionFetchError['error']);
                    sessionFileReject({ok: false, error: sessionFetchError['error']});
                });
            } else {
                sessionFileReject({ok: false, error: `Username ${sessionFileObject.username} does not exist in the user collection`});
            }
        });
    }

    /**
     * Gets session by session id. This function gets session informantion using sessionID
     * @param username
     * @param sessionID
     * @returns object containing ok key and error key specifying the error
     */
    getSessionBySessionID(username: string, sessionID: string): Promise<any> {
        return new Promise((getSessionResolve, getSessionReject) => {
            this.logger.info('finding user ' + username + ' with session id ' + sessionID);
            this.SessionModel.findOne({
                username,
                session_id: sessionID,
            }).then(sessionDoc => {
                if (!sessionDoc) {
                    this.logger.error('did not find any document in sessions collection corresponding to session_id' + sessionID);
                    getSessionReject({ok: false, error: 'did not find any document in sessions collection corresponding to session_id ' + sessionID});
                }
                this.logger.info('session object retrieved from db' +  JSON.stringify(sessionDoc));
                getSessionResolve(sessionDoc);
            })
            .catch(sessionError => {
                this.logger.error('sessionError : ');
                this.logger.error(sessionError);
                getSessionReject({ok: false, error: 'An error occured while verifying session username or session_id'});
            });
        });
    }

    /**
     * Checks username.Utility function which will look into the database and verify if the username provided is already present or not
     * @param usernameToValidate
     * @returns Promise<boolean>
     */
    checkUsername(usernameToValidate: string) {
        return new Promise((validresolve, reject) => {
            if (!usernameToValidate) {
                validresolve(false);
            } else {
                validresolve(this.userUtilitySrvc.userExists(usernameToValidate).catch(() => validresolve(false)));
            }
        });
    }

    getSessionsStatus(username: string) {
        return new Promise((resolve, reject) => {
            this.SessionModel.find({
                username,
            })
            .sort('-created')
            .then(sessionsData => {
                resolve({ok: true, data: sessionsData});
            })
            .catch((fetchErr) => {
                this.logger.info('Error while fetching session for user ' + username);
                this.logger.error(fetchErr);
                resolve({ok: false, error: `Error while fetching session for user ${username}`});
            });
        });
    }

    /**
     * Formats object. It basically converts session object into a format which is properly consumable by session apis
     * @param sessionObject
     * @returns  foramtted object from session
     */
    formatObject(sessionObject: object) {
        const cleanedObjectData = sessionObject['data'].map(session => {
            const finalObj = {
                name: session.name,
                session_id: session.session_id,
                created: session.created,
                isUploaded: session.isUploaded,
                username: session.username,
            };
            finalObj['topics'] = [];
            for (const topic of session.topics) {
                finalObj['topics'].push({
                    name: topic.topic_name,
                    isUploaded: topic.isUploaded,
                    topic_id: topic.topic_id ?  topic.topic_id : null});
            }
            return finalObj;
        });
        return cleanedObjectData;
    }
}
