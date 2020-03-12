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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const path_resolver_service_1 = require("../../../../services/path-resolver/path-resolver.service");
const path_1 = require("path");
const gcloud_service_1 = require("./../../../gcloud/services/gcloud/gcloud.service");
const ffmpeg_utility_service_1 = require("../../../../services/ffmpeg-utility/ffmpeg-utility.service");
const user_utility_service_1 = require("../../../users/services/user-utility/user-utility.service");
let SessionsUtilityService = class SessionsUtilityService {
    constructor(SessionModel, pathResolver, gcloudSrvc, ffmpeg, userUtilitySrvc) {
        this.SessionModel = SessionModel;
        this.pathResolver = pathResolver;
        this.gcloudSrvc = gcloudSrvc;
        this.ffmpeg = ffmpeg;
        this.userUtilitySrvc = userUtilitySrvc;
    }
    async getSessionList(username) {
        return new Promise((resolve, reject) => {
            this.SessionModel.find({ username }).sort('-created')
                .then(sessionList => {
                if (Array.isArray(sessionList)) {
                    resolve(sessionList);
                }
                else if (sessionList === null) {
                    resolve([]);
                }
            }).catch(err => {
                console.log('Error while fetching sessions list for ', username);
                console.log(err);
                resolve(null);
            });
        });
    }
    validateSessionObject(sessionData) {
        if (!sessionData ||
            sessionData.constructor !== Object ||
            Object.keys(sessionData).length === 0 ||
            (!sessionData.hasOwnProperty('name') ||
                !sessionData.hasOwnProperty('created') ||
                !sessionData.hasOwnProperty('session_id') ||
                !sessionData.hasOwnProperty('isUploaded') ||
                !sessionData.hasOwnProperty('topics_limit'))) {
            return false;
        }
        else {
            return true;
        }
    }
    async validateSessionBody(body) {
        if (body && body.constructor === Object) {
            if (Object.keys(body).length > 0) {
                if (body.hasOwnProperty('username') && typeof body['username'] === 'string' && body['username'].length) {
                    if (body.hasOwnProperty('sessions') && Array.isArray(body['sessions'])) {
                        if (body['sessions'].length > 0) {
                            let notValid;
                            for (let index = 0; index < body['sessions'].length; ++index) {
                                if (!this.validateSessionObject(body['sessions'][index])) {
                                    notValid = { ok: false, error: 'sessions object at index ' + index + ' seems invalid' };
                                    break;
                                }
                            }
                            if (notValid) {
                                return notValid;
                            }
                            else {
                                return { ok: true };
                            }
                        }
                        else {
                            return { ok: false, error: 'sessions array is empty' };
                        }
                    }
                    else {
                        return { ok: false, error: 'either sessions key is missing or it is not an array' };
                    }
                }
                else {
                    return { ok: false, error: 'username key at the root level is mandatory' };
                }
            }
            else {
                return { ok: false, error: 'body should not be an empty object' };
            }
        }
        else {
            return { ok: false, error: 'body is not an object' };
        }
    }
    async createUserSessionsInBatch(sessions) {
        return new Promise((resolve, reject) => {
            console.log('inserting ', sessions);
            if (sessions.length > 1) {
                console.log('cannot insert more than one sessions at a time');
                resolve({ ok: false, error: 'Multiple sessions sent for insert' });
            }
            else {
                const sessionToInsert = sessions[0];
                console.log('session to insert is ', sessionToInsert);
                this.SessionModel.find({ session_id: sessionToInsert.session_id })
                    .then(sessionRead => {
                    console.log('session read is ', sessionRead);
                    if (Array.isArray(sessionRead) && sessionRead.length < 1) {
                        console.log('No such session already present for ', sessionToInsert.session_id);
                        this.SessionModel.create(Object.assign({}, sessionToInsert))
                            .then(sessionCreated => {
                            console.log('session created ', sessionCreated);
                            resolve(sessionCreated);
                        })
                            .catch(creationError => {
                            console.log('Error while creating a new session ', creationError);
                            resolve(null);
                        });
                    }
                    else {
                        console.log('unexpected session read response ', sessionRead);
                        resolve({ ok: true, message: `session already exists, won't create a new one` });
                    }
                })
                    .catch(sessionReadErr => {
                    console.log('error while reading an existing session', sessionReadErr);
                    resolve(null);
                });
            }
        });
    }
    getSessionDetailsObject(files) {
        const sessionDetailsObject = {};
        return new Promise((resolve, reject) => {
            try {
                files.forEach(file => {
                    const info = file.originalname.split('_');
                    const [username, sessionid, topicName] = info;
                    const topicname = topicName.split('.wav')[0];
                    if (sessionDetailsObject.hasOwnProperty(username)) {
                        const fileObj = Object.assign({}, file);
                        fileObj['filename'] = fileObj.originalname.split('.wav')[0];
                        sessionDetailsObject[username]['topics'].push({ name: topicname, fileData: fileObj });
                    }
                    else {
                        sessionDetailsObject[username] = {};
                        sessionDetailsObject[username]['sessionid'] = sessionid;
                        sessionDetailsObject[username]['topics'] = [];
                        const fileObj = Object.assign({}, file);
                        fileObj['filename'] = fileObj.originalname.split('.wav')[0];
                        sessionDetailsObject[username]['topics'].push({ name: topicname, fileData: fileObj });
                    }
                });
                resolve(sessionDetailsObject);
            }
            catch (e) {
                console.log('An error occured while creating session details object ', e);
                resolve(null);
            }
        });
    }
    uploadFilesToCloudStorage(username, sessionID, parentSourceAddress, fileNames) {
        if (!parentSourceAddress) {
            parentSourceAddress = path_1.resolve(this.pathResolver.paths.TEMP_STORE_PATH);
            console.log('to upload files from ', `${username}/${sessionID}/mono inside `, parentSourceAddress);
        }
        else {
            console.log('to upload files from ', `${parentSourceAddress}`);
        }
        let addressObject = {};
        if (Array.isArray(fileNames) && fileNames.length > 0) {
            console.log('joining file names ', fileNames);
            addressObject = {
                filePaths: fileNames.map(fileName => path_1.resolve(parentSourceAddress, username, sessionID, 'mono', fileName)),
            };
            console.log('object looks like', addressObject);
        }
        else {
            addressObject = {
                parentFolderName: username,
                parentFolderAddress: path_1.resolve(parentSourceAddress, username),
                filesParentFolderAddr: `${sessionID}/mono`,
            };
        }
        const cloudDestinationDir = `${username}/${sessionID}`;
        return this.gcloudSrvc.uploadFilesToGCloud(addressObject, undefined, cloudDestinationDir);
    }
    convertTempFilesToMono(username, sessionID, topicID) {
        return new Promise((monoResolve, monoReject) => {
            const parentFolderAddr = path_1.resolve(this.pathResolver.paths.TEMP_STORE_PATH, username, sessionID);
            console.log('parent folder to pick files for mono conversion is ', parentFolderAddr);
            const fileName = `${username}_${sessionID}_${topicID}.wav`;
            this.ffmpeg.convertStereo2Mono(parentFolderAddr, fileName, () => {
                console.log('conversion to mono done');
                monoResolve({ ok: true });
            });
        });
    }
    updateSessionFileStatus(sessionFileObject) {
        console.log('updating session file status in database');
        return new Promise(async (sessionFileResolve, sessionFileReject) => {
            if (await this.userUtilitySrvc.userExists(sessionFileObject.username)) {
                this.getSessionBySessionID(sessionFileObject.username, sessionFileObject.sessionID)
                    .then(fetchedSession => {
                    console.log('fetched session from database is ');
                    console.log(fetchedSession);
                    const newTopicsArray = [...fetchedSession.topics];
                    const existingTopicIndex = newTopicsArray.findIndex(topic => topic.topic_name === sessionFileObject.topicName);
                    if (existingTopicIndex > -1) {
                        console.log('updating topic');
                        newTopicsArray[existingTopicIndex]['file_data']['bucketname'] = sessionFileObject.bucketname;
                        newTopicsArray[existingTopicIndex]['file_data']['filename'] = sessionFileObject.filename;
                        newTopicsArray[existingTopicIndex]['file_data']['mediaURI'] = sessionFileObject.gsURI;
                        newTopicsArray[existingTopicIndex]['file_data']['uploadedOn'] = sessionFileObject.uploadedOn;
                        newTopicsArray[existingTopicIndex]['file_data']['modifiedOn'] = sessionFileObject.modifiedOn;
                        newTopicsArray[existingTopicIndex]['file_data']['mediasize'] = sessionFileObject.mediaSize;
                        newTopicsArray[existingTopicIndex]['file_data']['ismono'] = true;
                        newTopicsArray[existingTopicIndex]['isUploaded'] = true;
                    }
                    else {
                        console.log('new topic');
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
                    let allUploaded = false;
                    if (newTopicsArray.length === fetchedSession['topics_limit']) {
                        if (!newTopicsArray.filter(topic => topic.isUploaded === false).length) {
                            console.log('detected all topics having there respective cloud files');
                            allUploaded = true;
                        }
                    }
                    console.log('final updation object"s topics looks like ');
                    console.log(newTopicsArray);
                    this.SessionModel.updateOne({
                        username: sessionFileObject.username,
                        session_id: sessionFileObject.sessionID
                    }, {
                        isUploaded: allUploaded !== fetchedSession.isUploaded ? allUploaded : fetchedSession.isUploaded,
                        topics: [...newTopicsArray],
                    }).then(updatedDoc => {
                        console.log('updated doc now looks like ');
                        console.log(updatedDoc);
                        sessionFileResolve({ ok: true, data: sessionFileObject });
                    }).catch(updationError => {
                        console.log(updationError);
                        sessionFileReject({ ok: false, error: 'An Error occured while updating the database document' });
                    });
                })
                    .catch(sessionFetchError => {
                    console.log(sessionFetchError['error']);
                    sessionFileReject({ ok: false, error: sessionFetchError['error'] });
                });
            }
            else {
                sessionFileReject({ ok: false, error: `Username ${sessionFileObject.username} does not exist in the user collection` });
            }
        });
    }
    getSessionBySessionID(username, sessionID) {
        return new Promise((getSessionResolve, getSessionReject) => {
            console.log('finding user ', username + ' with session id ' + sessionID);
            this.SessionModel.findOne({
                username,
                session_id: sessionID,
            }).then(sessionDoc => {
                if (!sessionDoc) {
                    console.log('did not find any document in sessions collection corresponding to session_id', sessionID);
                    getSessionReject({ ok: false, error: 'did not find any document in sessions collection corresponding to session_id ' + sessionID });
                }
                console.log('session object retrieved from db', sessionDoc);
                getSessionResolve(sessionDoc);
            })
                .catch(sessionError => {
                console.log('sessionError : ', sessionError);
                getSessionReject({ ok: false, error: 'An error occured while verifying session username or session_id' });
            });
        });
    }
    checkUsername(usernameToValidate) {
        return new Promise((validresolve, reject) => {
            if (!usernameToValidate) {
                validresolve(false);
            }
            else {
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
                resolve({ ok: true, data: sessionsData });
            })
                .catch((fetchErr) => {
                console.log('Error while fetching session for user ', username);
                console.log(fetchErr);
                resolve({ ok: false, error: `Error while fetching session for user ${username}` });
            });
        });
    }
    formatObject(sessionObject) {
        const cleanedObjectData = sessionObject['data'].map(session => {
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
                    topic_id: topic.topic_id ? topic.topic_id : null
                });
            }
            return finalObj;
        });
        return cleanedObjectData;
    }
};
SessionsUtilityService = __decorate([
    common_1.Injectable(),
    __param(0, mongoose_1.InjectModel('sessions')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        path_resolver_service_1.PathResolverService,
        gcloud_service_1.GcloudService,
        ffmpeg_utility_service_1.FfmpegUtilityService,
        user_utility_service_1.UserUtilityService])
], SessionsUtilityService);
exports.SessionsUtilityService = SessionsUtilityService;
//# sourceMappingURL=sessions-utility.service.js.map