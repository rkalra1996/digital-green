import { Model } from 'mongoose';
export declare type User = any;
export declare type Users = any;
import { Logger } from 'winston';
export declare class UserUtilityService {
    private readonly logger;
    private readonly UserModel;
    private readonly UsersModel;
    constructor(logger: Logger, UserModel: Model<User>, UsersModel: Model<Users>);
    findUserByUsername(username: string): Promise<User | undefined>;
    userExists(username: string): Promise<boolean>;
    validateUser(username: string, pass: string): Promise<any>;
    validateNewUser(userObj: any): {
        ok: boolean;
        error?: undefined;
    } | {
        ok: boolean;
        error: string;
    };
    getParsedNewUsers(userBody: any): any;
    validateAndParseNewUsers(userBody: any): {
        ok: boolean;
        users: any;
        status?: undefined;
        error?: undefined;
    } | {
        ok: boolean;
        status: number;
        error: string;
        users?: undefined;
    };
    registerUsers(newUsers: any): Promise<unknown>;
    validateReadUserObj(userObj: any): any;
    validateReadAllUsersBody(userBody: any): {
        ok: boolean;
        status: number;
        error: string;
    } | {
        ok: boolean;
        status?: undefined;
        error?: undefined;
    };
    parseUserObjForRead(userObj: any): any;
    readUsersFromDB(usersArray: any): Promise<unknown>;
    mergeUsersWithQuestions(usersArray: any, rolesArray: any): any;
    getRoleBasedInfo(rolesArray: any, userRole: any): {
        role: any;
        questions: any;
    };
    parseQuestions(questionArr: any): any;
}
