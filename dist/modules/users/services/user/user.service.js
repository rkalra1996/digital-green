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
const auth_service_1 = require("./../../../auth/services/auth/auth.service");
const user_utility_service_1 = require("../user-utility/user-utility.service");
let UserService = class UserService {
    constructor(logger, authSrvc, userUSrvc) {
        this.logger = logger;
        this.authSrvc = authSrvc;
        this.userUSrvc = userUSrvc;
    }
    async login(username, password) {
        const isUser = await this.userUSrvc.validateUser(username, password);
        if (isUser['ok']) {
            const tokenData = await this.authSrvc.login({ username: isUser.user.username, sub: isUser.user.userId, email: isUser.user.email });
            console.log('user ', username + ' logged in successfully');
            return Promise.resolve({ ok: true, data: tokenData });
        }
        else {
            console.log('user ', username + ' login failed ---> ' + isUser['error']);
            return Promise.resolve({ ok: isUser['ok'], status: isUser['status'], error: isUser['error'] });
        }
    }
    async register(requestBody) {
        const newUsers = this.userUSrvc.validateAndParseNewUsers(requestBody);
        if (newUsers['ok']) {
            const isCreated = await this.userUSrvc.registerUsers(newUsers['users']);
            if (isCreated['ok']) {
                return Promise.resolve({ ok: true, data: isCreated['users'] });
            }
            else {
                return Promise.resolve({ ok: false, status: (isCreated['status'] || 500), error: isCreated['error'] });
            }
        }
        else {
            console.log('error validating users ', newUsers['error']);
            return Promise.resolve({ ok: false, status: newUsers['status'], error: newUsers['error'] });
        }
    }
    readAllUsers(requestBody) {
        return new Promise((res, rej) => {
            const validated = this.userUSrvc.validateReadAllUsersBody(requestBody);
            if (validated['ok']) {
                const parsedUsers = this.userUSrvc.parseUserObjForRead(requestBody);
                this.userUSrvc.readUsersFromDB(parsedUsers)
                    .then(userList => {
                    this.logger.info('retrieved users as ' + JSON.stringify(userList));
                    res({ ok: true, data: userList });
                })
                    .catch(UreadErr => {
                    this.logger.error('got error while reading users in user read api ' + UreadErr);
                    res({ ok: false, status: 500, error: UreadErr });
                });
            }
            else {
                this.logger.error('validation error recorded while validating the user objects in user read api' + JSON.stringify(validated));
                res({ ok: false, status: validated['status'], error: validated['error'] });
            }
        });
    }
};
UserService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, auth_service_1.AuthService,
        user_utility_service_1.UserUtilityService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map