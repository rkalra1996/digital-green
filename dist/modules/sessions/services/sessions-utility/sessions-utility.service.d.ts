import { Model } from 'mongoose';
import { PathResolverService } from 'src/services/path-resolver/path-resolver.service';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { FfmpegUtilityService } from '../../../../services/ffmpeg-utility/ffmpeg-utility.service';
import { UserUtilityService } from '../../../users/services/user-utility/user-utility.service';
export declare type Session = any;
export declare class SessionsUtilityService {
    private readonly SessionModel;
    private readonly pathResolver;
    private readonly gcloudSrvc;
    private readonly ffmpeg;
    private readonly userUtilitySrvc;
    constructor(SessionModel: Model<Session>, pathResolver: PathResolverService, gcloudSrvc: GcloudService, ffmpeg: FfmpegUtilityService, userUtilitySrvc: UserUtilityService);
    getSessionList(username: string): Promise<unknown>;
    validateSessionObject(sessionData: any): boolean;
    validateSessionBody(body: object): Promise<object>;
    createUserSessionsInBatch(sessions: any): Promise<unknown>;
    getSessionDetailsObject(files: any): Promise<unknown>;
    uploadFilesToCloudStorage(username: any, sessionID: any, parentSourceAddress?: string, fileNames?: any[]): Promise<any>;
    convertTempFilesToMono(username: any, sessionID: any, topicID: any): Promise<unknown>;
    updateSessionFileStatus(sessionFileObject: any): Promise<any>;
    getSessionBySessionID(username: string, sessionID: string): Promise<any>;
    checkUsername(usernameToValidate: string): Promise<unknown>;
    getSessionsStatus(username: string): Promise<unknown>;
    formatObject(sessionObject: object): any;
}
