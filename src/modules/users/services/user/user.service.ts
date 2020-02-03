import { Injectable } from '@nestjs/common';
import { AuthService } from './../../../auth/services/auth/auth.service';
import { UserUtilityService } from '../user-utility/user-utility.service';

@Injectable()
export class UserService {

    constructor(private readonly authSrvc: AuthService, private readonly userUSrvc: UserUtilityService) {}
    /**
     * @description This function will internally check if the user exists and returns access token
     * @param username string
     * @param password string
     * @returns object containing access_token
     */
    async login(username: string, password: string): Promise<any> {
      const isUser = await this.userUSrvc.validateUser(username, password);
      if (isUser['ok']) {
        // get the access token
        const tokenData = await this.authSrvc.login({username: isUser.username, sub: isUser.userId, email: isUser.email});
        console.log('user ', username + ' logged in successfully');
        return Promise.resolve({ok: true, data: tokenData});
      } else {
        console.log('user ', username + ' login failed ---> ' + isUser['error']);
        return Promise.resolve({ok: isUser['ok'], status: isUser['status'], error: isUser['error']});
      }
    }
}
