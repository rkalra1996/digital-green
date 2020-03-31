"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const sessions_service_1 = require("../../services/sessions/sessions.service");
const sessions_utility_service_1 = require("../../services/sessions-utility/sessions-utility.service");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
let SessionsController = class SessionsController {
    constructor(logger, sessionsSrvc, sessionsUSrvc) {
        this.logger = logger;
        this.sessionsSrvc = sessionsSrvc;
        this.sessionsUSrvc = sessionsUSrvc;
    }
    async getSessions(requestBody, response) {
        this.logger.info('POST sessions/read');
        const getSessions = await this.sessionsSrvc.getUserSessions(requestBody.username);
        if (getSessions['ok']) {
            return response.status(200).send({ status: 200, data: getSessions['data'] });
        }
        return response.status(getSessions['status']).send({ status: getSessions['status'], error: getSessions['error'] });
    }
    async createSessions(requestBody, response) {
        this.logger.info('POST sessions/create');
        const isBodyValid = await this.sessionsUSrvc.validateSessionBody(requestBody);
        if (isBodyValid['ok']) {
            const sessionsCreated = await this.sessionsSrvc.createUserSessions(requestBody);
            if (sessionsCreated['ok']) {
                return response.status(200).send({ status: 200, sessions: sessionsCreated['data'] });
            }
            return response.status(sessionsCreated['status']).send({ status: sessionsCreated['status'], error: sessionsCreated['error'] });
        }
        else {
            return response.status(400).send({ status: 400, error: isBodyValid['error'] });
        }
    }
    async uploadSessionToCloud(response, params, sessionRawFiles, requestBody) {
        this.logger.info('POST /sessions/upload');
        this.logger.info('raw files are ', +JSON.stringify(sessionRawFiles));
        this.logger.info('request body ' + JSON.stringify(requestBody));
        const sessionDetailsObject = await this.sessionsUSrvc.getSessionDetailsObject(sessionRawFiles);
        if (!sessionDetailsObject) {
            return response.status(500).send({ status: 500, error: 'An error occured while collecting files for upload, try again later' });
        }
        this.sessionsSrvc.initiateUpload(sessionDetailsObject)
            .then(sessionUploaded => {
            this.logger.info('Session uploaded started successfully');
        })
            .catch(sessionUploadError => {
            this.logger.info('An error occured while complete session upload');
            this.logger.error(sessionUploadError);
        });
        return response.status(200).send({ status: 200, message: 'Upload procedure started successfully' });
    }
    async getSessionsStatus(response, params) {
        this.logger.info(`GET sessions/status/${params.username}`);
        if (await this.sessionsUSrvc.checkUsername(params.username)) {
            this.logger.info('user exists');
            const sessionStatus = await this.sessionsSrvc.getUserSessionsStatus(params.username);
            if (sessionStatus['ok']) {
                return response.status(200).send({ status: 200, data: sessionStatus['data'] });
            }
            else {
                return response.status(sessionStatus['status']).send({ status: sessionStatus['status'], error: sessionStatus['error'] });
            }
        }
        else {
            this.logger.info('user does not exist');
            return response.status(400).send({ status: 400, error: `Username ${params.username} is undefined or does not exists` });
        }
    }
};
__decorate([
    common_1.Post('read'),
    __param(0, common_1.Body()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessions", null);
__decorate([
    common_1.Post('create'),
    __param(0, common_1.Body()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "createSessions", null);
__decorate([
    common_1.Post('upload'),
    common_1.UseInterceptors(platform_express_1.FilesInterceptor('session_recordings')),
    __param(0, common_1.Res()), __param(1, common_1.Param()), __param(2, common_1.UploadedFiles()), __param(3, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "uploadSessionToCloud", null);
__decorate([
    common_1.Get('status/:username'),
    __param(0, common_1.Res()), __param(1, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SessionsController.prototype, "getSessionsStatus", null);
SessionsController = __decorate([
    common_1.UseGuards(passport_1.AuthGuard('jwt')),
    common_1.Controller('sessions'),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, sessions_service_1.SessionsService,
        sessions_utility_service_1.SessionsUtilityService])
], SessionsController);
exports.SessionsController = SessionsController;
//# sourceMappingURL=sessions.controller.js.map