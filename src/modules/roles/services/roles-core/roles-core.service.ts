import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { RolesUtilityService } from '../roles-utility/roles-utility.service';

@Injectable()
export class RolesCoreService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly rolesUtilitySrvc: RolesUtilityService,
    ) {}

    async getUserRoles(body: object) {
        const isParsed = this.rolesUtilitySrvc.validateAndParseBody(body);
        if (isParsed['ok']) {
            if (isParsed.roles.length > 0) {
                // request for specific role
                const userRoles = await this.rolesUtilitySrvc.getUserRole(isParsed.roles);
                return this.sendResponse(userRoles)
            } else {
                // request for all roles
                const userRoles = await this.rolesUtilitySrvc.getAllRoles();
                return this.sendResponse(userRoles);
            }
        } else {
            return {ok: false, status: 400, error: isParsed['error']};
        }
    }

    sendResponse(userRoles) {
        if (userRoles['ok']) {
            return {ok: true, status: 200, data: userRoles['data']};
        } else {
            return {ok: false, status: userRoles['status'], error: userRoles['error']};
        }
    }
}
