import { AuthService } from './../../../auth/services/auth/auth.service';
import { UserUtilityService } from '../user-utility/user-utility.service';
import { Logger } from 'winston';
export declare class UserService {
    private readonly logger;
    private readonly authSrvc;
    private readonly userUSrvc;
    constructor(logger: Logger, authSrvc: AuthService, userUSrvc: UserUtilityService);
    login(username: string, password: string): Promise<any>;
    register(requestBody: any): Promise<{
        ok: boolean;
        data: any;
    } | {
        ok: boolean;
        status: any;
        error: any;
    }>;
    readAllUsers(requestBody: any): Promise<object>;
}
