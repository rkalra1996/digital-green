import { AuthService } from './../../../auth/services/auth/auth.service';
import { UserUtilityService } from '../user-utility/user-utility.service';
import { Logger } from 'winston';
import { RolesUtilityService } from './../../../roles/services/roles-utility/roles-utility.service';
export declare class UserService {
    private readonly logger;
    private readonly authSrvc;
    private readonly userUSrvc;
    private readonly rolesUSrvc;
    constructor(logger: Logger, authSrvc: AuthService, userUSrvc: UserUtilityService, rolesUSrvc: RolesUtilityService);
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
    readUsersWithQuestions(): Promise<{
        ok: boolean;
        data: any;
        status?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        status: any;
        error: any;
        data?: undefined;
    }>;
}
