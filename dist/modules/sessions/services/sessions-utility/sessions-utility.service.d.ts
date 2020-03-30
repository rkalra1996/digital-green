import { Model } from 'mongoose';
import { PathResolverService } from 'src/services/path-resolver/path-resolver.service';
import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { FfmpegUtilityService } from '../../../../services/ffmpeg-utility/ffmpeg-utility.service';
import { UserUtilityService } from '../../../users/services/user-utility/user-utility.service';
import { Logger } from 'winston';
export declare type Session = any;
export declare class SessionsUtilityService {
    private readonly logger;
    private readonly SessionModel;
    private readonly pathResolver;
    private readonly gcloudSrvc;
    private readonly ffmpeg;
    private readonly userUtilitySrvc;
    constructor(logger: Logger, SessionModel: Model<Session>, pathResolver: PathResolverService, gcloudSrvc: GcloudService, ffmpeg: FfmpegUtilityService, userUtilitySrvc: UserUtilityService);
    getSessionList(username?: string, dateFilterObj?: object): Promise<unknown>;
    getSessionQuery(dateFilterObj: object, username?: string): {
        username: string;
    } | {
        username?: undefined;
    };
    getCompleteDay(date: any): Date;
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
