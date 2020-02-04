import { Injectable } from '@nestjs/common';
import { SessionsUtilityService } from '../sessions-utility/sessions-utility.service';
import { UserUtilityService } from 'src/modules/users/services/user-utility/user-utility.service';

@Injectable()
export class SessionsService {
    constructor(
        private readonly sessionsUtilitySrvc: SessionsUtilityService,
        private readonly userUtilitySrvc: UserUtilityService) {}

    async getUserSessions(username: string) {
        if (username && typeof username === 'string') {
            // verify if the username is a validone
            const userExists = await this.userUtilitySrvc.userExists(username);
            if (typeof userExists === 'boolean') {
                if (userExists) {
                    // find user sessions
                const sessionsList = await this.sessionsUtilitySrvc.getSessionList(username);
                if (sessionsList) {
                    return {ok: true, status: 200, data: sessionsList};
                }
                return {ok: false, status: 500, error: 'An error occured while reading sessions for user ' + username};
                } else {
                    return {ok: false, status: 400, error: 'USER ' + username + ' DOES NOT EXISTS'};
                }
            }
        } else {
            return {ok: false, status: 400, error: 'USERNAME EMPTY'};
        }
    }
}
