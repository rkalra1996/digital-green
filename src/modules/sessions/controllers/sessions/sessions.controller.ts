import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { SessionsService } from '../../services/sessions/sessions.service';
import { SessionsUtilityService } from '../../services/sessions-utility/sessions-utility.service';
import { AuthGuard } from '@nestjs/passport';

// jwt protected controller - All routes must have jwt bearer token to work with
@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionsController {

    constructor(
        private readonly sessionsSrvc: SessionsService,
        private readonly sessionsUSrvc: SessionsUtilityService,
        ) {}

    @Post('')
    async getSessions(@Body() requestBody, @Res() response): Promise<any> {
        console.log('POST sessions');
        const getSessions = await this.sessionsSrvc.getUserSessions(requestBody.username);
        if (getSessions['ok']) {
            return response.status(200).send({status: 200, data: getSessions['data']});
        }
        return response.status(getSessions['status']).send({status: getSessions['status'], error: getSessions['error']});
    }

    @Post('create')
    async createSessions(@Body() requestBody, @Res() response): Promise<any> {
        console.log('POST sessions/create');
        // validate the request body
        const isBodyValid = await this.sessionsUSrvc.validateSessionBody(requestBody);
        if (isBodyValid['ok']) {
            const sessionsCreated = await this.sessionsSrvc.createUserSessions(requestBody);
            if (sessionsCreated['ok']) {
                return response.status(200).send({status: 200, sessions: sessionsCreated['data']});
            }
            return response.status(sessionsCreated['status']).send({status: sessionsCreated['status'], error: sessionsCreated['error']});
        } else {
            return response.status(400).send({status: 400, error: isBodyValid['error']});
        }
    }
}
