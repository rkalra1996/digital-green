import { Strategy } from 'passport-local';
import { UserUtilityService } from 'src/modules/users/services/user-utility/user-utility.service';
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private readonly userUSrvc;
    constructor(userUSrvc: UserUtilityService);
    validate(username: string, password: string): Promise<any>;
}
export {};
