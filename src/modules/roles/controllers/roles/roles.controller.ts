import { Controller, Inject, Body, Res, Post } from '@nestjs/common';

import {Logger} from 'winston';
import { RolesCoreService } from '../../services/roles-core/roles-core.service';

@Controller('roles')
export class RolesController {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly rolesCoreSrvc: RolesCoreService,
        ) {}

    @Post('users')
    async getUserRoles(@Body() requestBody, @Res() response): Promise<any> {
        this.logger.info('POST /roles/users hit');
        const userRoles = await this.rolesCoreSrvc.getUserRoles(requestBody);
        if (userRoles['ok']) {
            this.logger.info('sending success response for /role/users');
            return response.status(200).send({status: 200, data: userRoles['data']});
        } else {
            this.logger.error('got error response from /roles/users');
            this.logger.error(`sending resoponse as ${JSON.stringify(userRoles)}`);
            return response.status(userRoles['status']).send({status: userRoles['status'] || 500, error: userRoles['error']});
        }
    }
}
