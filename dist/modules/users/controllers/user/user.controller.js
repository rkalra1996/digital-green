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
const user_service_1 = require("../../services/user/user.service");
let UserController = class UserController {
    constructor(logger, userService) {
        this.logger = logger;
        this.userService = userService;
    }
    async registerUser(requestBody, response) {
        console.log('POST user/register');
        const isRegistered = await this.userService.register(requestBody);
        if (!isRegistered['ok']) {
            return response.status(isRegistered['status']).send({ status: isRegistered['status'], error: isRegistered['error'] });
        }
        return response.status(200).send(isRegistered['data']);
    }
    async userUser(requestBody, response) {
        console.log('POST user/login');
        const loggedIn = await this.userService.login(requestBody.username, requestBody.password);
        if (!loggedIn['ok']) {
            return response.status(loggedIn['status']).send({ status: loggedIn['status'], error: loggedIn['error'] });
        }
        return response.status(200).send(loggedIn['data']);
    }
    async listAllUsers(response, body) {
        this.logger.info('GET /user/list hit');
        const users = await this.userService.readAllUsers(body);
        if (users['ok']) {
            this.logger.info('sending abck users list as ' + JSON.stringify(users));
            return response.status(200).send({ status: 200, users: users['data'] });
        }
        else {
            this.logger.error('detected err while reading allusers api' + JSON.stringify(users));
            return response.status(users['status']).send({ status: users['status'], error: users['error'] });
        }
    }
};
__decorate([
    common_1.Post('register'),
    __param(0, common_1.Body()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "registerUser", null);
__decorate([
    common_1.Post('login'),
    __param(0, common_1.Body()), __param(1, common_1.Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "userUser", null);
__decorate([
    common_1.Post('list'),
    __param(0, common_1.Res()), __param(1, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "listAllUsers", null);
UserController = __decorate([
    common_1.Controller('user'),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map