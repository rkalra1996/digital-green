import { Controller, Post, Body, Res } from '@nestjs/common';
import { SessionsService } from '../../services/sessions/sessions.service';

@Controller('sessions')
export class SessionsController {

    constructor(private readonly sessionsSrvc: SessionsService) {}

    @Post('')
    async getSessions(@Body() requestBody, @Res() response): Promise<any> {
        console.log('POST sessions');
        const getSessions = await this.sessionsSrvc.getUserSessions(requestBody.username);
        if (getSessions['ok']) {
            return response.status(200).send({status: 200, data: getSessions['data']});
        }
        return response.status(getSessions['status']).send({status: getSessions['status'], error: getSessions['error']});
    }
}
