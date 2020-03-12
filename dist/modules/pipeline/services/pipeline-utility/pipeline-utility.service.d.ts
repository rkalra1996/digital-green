import { Model } from 'mongoose';
export declare type Session = any;
export declare class PipelineUtilityService {
    private readonly SessionModel;
    constructor(SessionModel: Model<Session>);
    updateSessionTopicInDB(userInfoObj: any, dataToAdd: any): Promise<boolean | string>;
    updateSessionTopicStatusFailure(userObj: any, dataToAdd: any): Promise<object>;
}
