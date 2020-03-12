import { UserService } from '../../services/user/user.service';
import { Logger } from 'winston';
export declare class UserController {
    private readonly logger;
    private readonly userService;
    constructor(logger: Logger, userService: UserService);
    registerUser(requestBody: any, response: any): Promise<any>;
    userUser(requestBody: any, response: any): Promise<any>;
    listAllUsers(response: any, body: any): Promise<any>;
}
