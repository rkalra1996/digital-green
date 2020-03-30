import { Injectable, Inject } from '@nestjs/common';
import { AuthService } from './../../../auth/services/auth/auth.service';
import { UserUtilityService } from '../user-utility/user-utility.service';

import {Logger} from 'winston';
import { RolesUtilityService } from './../../../roles/services/roles-utility/roles-utility.service';

@Injectable()
export class UserService {

    constructor(
      @Inject('winston') private readonly logger: Logger,
      private readonly authSrvc: AuthService,
      private readonly userUSrvc: UserUtilityService,
      private readonly rolesUSrvc: RolesUtilityService,
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
          .then(userList => {
            this.logger.info('retrieved users as ' + JSON.stringify(userList));
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

    /**
     * Reads users with questions.
     * @description This function is a mapper, which maps all the users with the questions being assigned to them, on the basis of user role and
     * return the result
     * 
     */
    async readUsersWithQuestions() {
      const allUsers = await this.userUSrvc.readUsersFromDB([]);
      if (Array.isArray(allUsers)) {
        // read the role specific information from the database
        const rolesInfo = await this.rolesUSrvc.getAllRoles();
        if (rolesInfo['ok']) {
          try {
            const mergedUsersWithQuestions = this.userUSrvc.mergeUsersWithQuestions(allUsers, rolesInfo['data']);
            return {ok: true, data: mergedUsersWithQuestions};
          } catch(e) {
            this.logger.info('An error occured while merging users with their role specific questions');
            this.logger.error(e);
            return {ok: false, status: 500, error: 'An unexpected error occured while merging users, try again later'};
          }
        } else {
          return {ok: false, status: rolesInfo['status'], error: rolesInfo['error']};
        }
      } else {
        return {ok: false, status: allUsers['status'] || 500, error: allUsers['error'] || 'An unexpected error while reading all users'};
      }
    }
}
