import { Model } from 'mongoose';
import { Logger } from 'winston';
export declare type Session = any;
export declare class PipelineUtilityService {
    private readonly logger;
    private readonly SessionModel;
    constructor(logger: Logger, SessionModel: Model<Session>);
    updateSessionTopicInDB(userInfoObj: any, dataToAdd: any): Promise<boolean | string>;
    updateSessionTopicStatusFailure(userObj: any, dataToAdd: any): Promise<object>;
}
