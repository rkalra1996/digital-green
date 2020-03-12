import { SessionsUtilityService } from '../sessions-utility/sessions-utility.service';
import { UserUtilityService } from './../../../users/services/user-utility/user-utility.service';
import { SharedService } from './../../../../services/shared/shared.service';
export declare class SessionsService {
    private readonly sessionsUtilitySrvc;
    private readonly userUtilitySrvc;
    private readonly sharedSrvc;
    GCLOUD_STORAGE: string;
    GCLOUD_BUCKET: string;
    constructor(sessionsUtilitySrvc: SessionsUtilityService, userUtilitySrvc: UserUtilityService, sharedSrvc: SharedService);
    getUserSessions(username: string): Promise<{
        ok: boolean;
        status: number;
        data: unknown;
        error?: undefined;
    } | {
        ok: boolean;
        status: number;
        error: string;
        data?: undefined;
    }>;
    createUserSessions(sessionData: object): Promise<any>;
    initiateUpload(sessionObject: any, cloudType?: string): Promise<any>;
    getUserSessionsStatus(username: any): Promise<{
        ok: boolean;
        data: any;
        error?: undefined;
    } | {
        ok: boolean;
        error: any;
        data?: undefined;
    }>;
}
