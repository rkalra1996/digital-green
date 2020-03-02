import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PathResolverService } from 'src/services/path-resolver/path-resolver.service';
import {resolve} from 'path';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { FfmpegUtilityService } from '../../../../services/ffmpeg-utility/ffmpeg-utility.service';
import { UserUtilityService } from '../../../users/services/user-utility/user-utility.service';

export type Session = any;

@Injectable()
export class SessionsUtilityService {
    constructor(
        @InjectModel('sessions') private readonly SessionModel: Model<Session>,
        private readonly pathResolver: PathResolverService,
        private readonly gcloudSrvc: GcloudService,
        private readonly ffmpeg: FfmpegUtilityService,
        private readonly userUtilitySrvc: UserUtilityService,
        ) {}

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
                !sessionData.hasOwnProperty('isUploaded') ||
                !sessionData.hasOwnProperty('topics_limit')
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
            if (sessions.length > 1) {
                console.log('cannot insert more than one sessions at a time');
                resolve({ok: false, error: 'Multiple sessions sent for insert'});
            } else {
                // read the session first, if it exists, ignore else create
                const sessionToInsert = sessions[0];
                console.log('session to insert is ', sessionToInsert);
                this.SessionModel.find({session_id: sessionToInsert.session_id})
                .then(sessionRead => {
                    console.log('session read is ', sessionRead);
                    if (Array.isArray(sessionRead) && sessionRead.length < 1) {
                        // no session id exists, creating new one
                        console.log('No such session already present for ', sessionToInsert.session_id);
                        // no such session found, insert it
                        this.SessionModel.create({...sessionToInsert})
                        .then(sessionCreated => {
                            console.log('session created ', sessionCreated);
                            resolve(sessionCreated);
                        })
                        .catch(creationError => {
                            console.log('Error while creating a new session ', creationError);
                            resolve(null);
                        });
                    } else {
                        console.log('unexpected session read response ', sessionRead);
                        resolve({ok: true, message: `session already exists, won't create a new one`});
                    }
                })
                .catch(sessionReadErr => {
                    console.log('error while reading an existing session', sessionReadErr);
                    resolve(null);
                });
                /* this.SessionModel.insertMany([...sessions])
            .then(isInserted => {
                console.log('inserted ', isInserted);
                resolve(isInserted);
            })
            .catch(insertErr => {
                console.log('insert Error', insertErr);
                resolve(null);
            }); */
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
                        // writeFileSync(file.originalname, file.buffer);
                        const info = file.originalname.split('_');
                        // storing username
                        const username = info[0];
                        const sessionid = info[1];
                        const topicname = info[2].split('.wav')[0];
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
                    console.log('An error occured while creating session details object ', e);
                    resolve(null);
                }
            });
        }

    uploadFilesToCloudStorage(username, sessionID, parentSourceAddress?: string, fileNames?: any[]) {
        if (!parentSourceAddress) {
            parentSourceAddress = resolve(this.pathResolver.paths.TEMP_STORE_PATH);
            console.log('to upload files from ', `${username}/${sessionID}/mono inside `, parentSourceAddress);
        } else {
            console.log('to upload files from ', `${parentSourceAddress}`);
        }
        let addressObject = {};
        if (Array.isArray(fileNames) && fileNames.length > 0) {
            console.log('joining file names ', fileNames);
            addressObject = {
            filePaths: fileNames.map(fileName => resolve(parentSourceAddress,username,sessionID, 'mono', fileName)),
            };
            console.log('object looks like', addressObject);
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

    convertTempFilesToMono(username, sessionID, topicID) {
        return new Promise((monoResolve, monoReject) => {
            const parentFolderAddr = resolve(this.pathResolver.paths.TEMP_STORE_PATH, username, sessionID);
            console.log('parent folder to pick files for mono conversion is ', parentFolderAddr);
            // start mono conversion
            const fileName = `${username}_${sessionID}_${topicID}.wav`;
            this.ffmpeg.convertStereo2Mono(parentFolderAddr, fileName , () => {
                console.log('conversion to mono done');
                monoResolve({ok: true});
            });
        });
    }

    updateSessionFileStatus(sessionFileObject): Promise<any> {
        console.log('updating session file status in database');
        return new Promise(async (sessionFileResolve, sessionFileReject) => {
            // check if user exists
            if (await this.userUtilitySrvc.userExists(sessionFileObject.username)) {
                // check if session is already created
                this.getSessionBySessionID(sessionFileObject.username, sessionFileObject.sessionID)
                .then(fetchedSession => {
                    console.log('fetched session from database is ');
                    console.log(fetchedSession);
                    const newTopicsArray = [...fetchedSession.topics];
                    // add the file status to the session
                    const existingTopicIndex = newTopicsArray.findIndex(topic => topic.topic_name === sessionFileObject.topicName);
                    if (existingTopicIndex > -1) {
                        console.log('updating topic');
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
                        console.log('new topic');
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
                            console.log('detected all topics having there respective cloud files');
                            allUploaded = true;
                        }
                    }
                    // all data has been modified
                    console.log('final updation object"s topics looks like ');
                    console.log(newTopicsArray);
                    this.SessionModel.updateOne(
                        {
                        username: sessionFileObject.username,
                        session_id: sessionFileObject.sessionID}
                        , {
                            isUploaded: allUploaded !== fetchedSession.isUploaded ? allUploaded : fetchedSession.isUploaded,
                            topics: [...newTopicsArray],
                        },
                        ).then(updatedDoc => {
                            console.log('updated doc now looks like ');
                            console.log(updatedDoc);
                            sessionFileResolve({ok: true, data: sessionFileObject});
                        }).catch(updationError => {
                            console.log(updationError);
                            sessionFileReject({ok: false, error: 'An Error occured while updating the database document'});
                        });
                })
                .catch(sessionFetchError => {
                    console.log(sessionFetchError['error']);
                    sessionFileReject({ok: false, error: sessionFetchError['error']});
                });
            } else {
                sessionFileReject({ok: false, error: `Username ${sessionFileObject.username} does not exist in the user collection`});
            }
        });
    }

    getSessionBySessionID(username, sessionID): Promise<any> {
        return new Promise((getSessionResolve, getSessionReject) => {
            console.log('finding user ', username + ' with session id ' + sessionID);
            this.SessionModel.findOne({
                username,
                session_id: sessionID,
            }).then(sessionDoc => {
                if (!sessionDoc) {
                    console.log('did not find any document in sessions collection corresponding to session_id', sessionID);
                    getSessionReject({ok: false, error: 'did not find any document in sessions collection corresponding to session_id ' + sessionID});
                }
                console.log('session object retrieved from db', sessionDoc);
                getSessionResolve(sessionDoc);
            })
            .catch(sessionError => {
                console.log('sessionError : ', sessionError);
                getSessionReject({ok: false, error: 'An error occured while verifying session username or session_id'});
            });
        });
    }

    checkUsername(usernameToValidate) {
        return new Promise((validresolve, reject) => {
            if (!usernameToValidate) {
                validresolve(false);
            } else {
                validresolve(this.userUtilitySrvc.userExists(usernameToValidate).catch(() => validresolve(false)));
            }
        });
    }

    getSessionsStatus(username) {
        return new Promise((resolve, reject) => {
            this.SessionModel.find({
                username,
            })
            .sort('-created')
            .then(sessionsData => {
                resolve({ok: true, data: sessionsData});
            })
            .catch((fetchErr) => {
                console.log('Error while fetching session for user ', username);
                console.log(fetchErr);
                resolve({ok: false, error: `Error while fetching session for user ${username}`});
            });
        });
    }

    formatObject(sessionObject) {
        const cleanedObjectData = sessionObject.data.map(session => {
            const finalObj = {
                name: session.name,
                session_id: session.session_id,
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
