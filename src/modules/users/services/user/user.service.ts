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
        const tokenData = await this.authSrvc.login({username: isUser.user.username, sub: isUser.user.userId, email: isUser.user.email});
        console.log('user ', username + ' logged in successfully');
        return Promise.resolve({ok: true, data: tokenData});
      } else {
        console.log('user ', username + ' login failed ---> ' + isUser['error']);
        return Promise.resolve({ok: isUser['ok'], status: isUser['status'], error: isUser['error']});
      }
    }

    async register(requestBody) {
      const newUsers = this.userUSrvc.validateAndParseNewUsers(requestBody);
      if (newUsers['ok']) {
        // newUsers contains the batch of users present
        const isCreated = await this.userUSrvc.registerUsers(newUsers['users']);
        if (isCreated['ok']) {
          return Promise.resolve({ok: true, data: isCreated['users']});
        } else {
          return Promise.resolve({ok: false, status: (isCreated['status'] || 500), error: isCreated['error']});
        }
      } else {
        console.log('error validating users ', newUsers['error']);
        return Promise.resolve({ok: false, status: newUsers['status'], error: newUsers['error']});
      }
    }
}
