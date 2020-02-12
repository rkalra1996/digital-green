import { Controller, Post, Body, Res, UseGuards, Param, UseInterceptors, UploadedFiles, Get } from '@nestjs/common';
import { SessionsService } from '../../services/sessions/sessions.service';
import { SessionsUtilityService } from '../../services/sessions-utility/sessions-utility.service';
import { AuthGuard } from '@nestjs/passport';
import {FilesInterceptor} from '@nestjs/platform-express';

// jwt protected controller - All routes must have jwt bearer token to work with
@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionsController {

    constructor(
        private readonly sessionsSrvc: SessionsService,
        private readonly sessionsUSrvc: SessionsUtilityService,
        ) {}

    @Post('read')
    async getSessions(@Body() requestBody, @Res() response): Promise<any> {
        console.log('POST sessions/read');
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

    @Post('upload')
    @UseInterceptors(FilesInterceptor('session_recordings'))
    async uploadSessionToCloud(@Res() response , @Param() params, @UploadedFiles() sessionRawFiles, @Body() requestBody): Promise<any> {
        console.log('POST /sessions/upload');
        console.log(sessionRawFiles);
        console.log(requestBody);
        const sessionDetailsObject = await this.sessionsUSrvc.getSessionDetailsObject(sessionRawFiles);
        if (!sessionDetailsObject) {
            return response.status(500).send({status: 500, error: 'An error occured while collecting files for upload, try again later'});
        }
        // sessionDetails are ready, initiate upload
        this.sessionsSrvc.initiateUpload(sessionDetailsObject)
        .then(sessionUploaded => {
            console.log('Session uploaded started successfully');
        })
        .catch(sessionUploadError => {
            console.log('An error occured while complete session upload');
        });
        return response.status(200).send({status: 200, message: 'Upload procedure started successfully'});
    }

    @Get('status/:username')
    async getSessionsStatus(@Res() response, @Param() params): Promise<any> {
        console.log(`GET sessions/status/${params.username}`);
        if (await this.sessionsUSrvc.checkUsername(params.username)) {
            console.log('user exists');
            const sessionStatus = await this.sessionsSrvc.getUserSessionsStatus(params.username);
            if (sessionStatus['ok']) {
                return response.status(200).send({status: 200, data: sessionStatus['data']});
            } else {
                return response.status(sessionStatus['status']).send({status: sessionStatus['status'], error: sessionStatus['error']});
            }
        } else {
            console.log('user does not exist');
            return response.status(400).send({status: 400, error: `Username ${params.username} is undefined or does not exists`});
        }
    }
}
