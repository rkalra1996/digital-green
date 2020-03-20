import { Injectable, Inject } from '@nestjs/common';
import { AuthService } from './../../../auth/services/auth/auth.service';
import { UserUtilityService } from '../user-utility/user-utility.service';

import {Logger} from 'winston';

@Injectable()
export class UserService {

    constructor(
      @Inject('winston') private readonly logger: Logger,
      private readonly authSrvc: AuthService,
      private readonly userUSrvc: UserUtilityService,
      ) {}
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
        this.logger.info('user ' + username + ' logged in successfully');
        return Promise.resolve({ok: true, data: tokenData});
      } else {
        this.logger.info('user ' + username + ' login failed ---> ');
        this.logger.error(isUser['error']);
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
        this.logger.info('error validating users ');
        this.logger.error(newUsers['error']);
        return Promise.resolve({ok: false, status: newUsers['status'], error: newUsers['error']});
      }
    }

    /**
     * Reads all users. This function is multi purpose in the sense that if the input array is empty, it
     * will return all the users present in the db. If username is provided in the array object,it will return those users only
     * @returns list of users present in the db
     */
    readAllUsers(requestBody): Promise<object> {
      return new Promise((res, rej) => {
        const validated = this.userUSrvc.validateReadAllUsersBody(requestBody);
        if (validated['ok']) {
          // parse the usersObjects as needed
          const parsedUsers = this.userUSrvc.parseUserObjForRead(requestBody);
          this.userUSrvc.readUsersFromDB(parsedUsers)
          .then((userList: object[] | null) => {
            this.logger.info('retrieved total users ' + userList.length);
            res({ok: true, data: userList});
          })
          .catch(UreadErr => {
            this.logger.info('got error while reading users in user read api ');
            this.logger.error(UreadErr);
            res({ok: false, status: 500, error: UreadErr});
          });
        } else {
          this.logger.info('validation error recorded while validating the user objects in user read api');
          this.logger.error(JSON.stringify(validated));
          res({ok: false, status: validated['status'], error: validated['error']});
        }
      });
    }
}
