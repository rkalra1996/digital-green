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
const roles_utility_service_1 = require("./../../../roles/services/roles-utility/roles-utility.service");
let UserService = class UserService {
    constructor(logger, authSrvc, userUSrvc, rolesUSrvc) {
        this.logger = logger;
        this.authSrvc = authSrvc;
        this.userUSrvc = userUSrvc;
        this.rolesUSrvc = rolesUSrvc;
    }
    async login(username, password) {
        const isUser = await this.userUSrvc.validateUser(username, password);
        if (isUser['ok']) {
            const tokenData = await this.authSrvc.login({ username: isUser.user.username, sub: isUser.user.userId, email: isUser.user.email });
            this.logger.info('user ' + username + ' logged in successfully');
            return Promise.resolve({ ok: true, data: tokenData });
        }
        else {
            this.logger.info('user ' + username + ' login failed ---> ');
            this.logger.error(isUser['error']);
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
            this.logger.info('error validating users ');
            this.logger.error(newUsers['error']);
            return Promise.resolve({ ok: false, status: newUsers['status'], error: newUsers['error'] });
        }
    }
    readAllUsers(requestBody) {
        return new Promise((res, rej) => {
            const validated = this.userUSrvc.validateReadAllUsersBody(requestBody);
            if (validated['ok']) {
                const parsedUsers = this.userUSrvc.parseUserObjForRead(requestBody);
                this.userUSrvc.readUsersFromDB(parsedUsers)
                    .then((userList) => {
                    this.logger.info('retrieved total users ' + userList.length);
                    res({ ok: true, data: userList });
                })
                    .catch(UreadErr => {
                    this.logger.info('got error while reading users in user read api ');
                    this.logger.error(UreadErr);
                    res({ ok: false, status: 500, error: UreadErr });
                });
            }
            else {
                this.logger.info('validation error recorded while validating the user objects in user read api');
                this.logger.error(JSON.stringify(validated));
                res({ ok: false, status: validated['status'], error: validated['error'] });
            }
        });
    }
    async readUsersWithQuestions() {
        const allUsers = await this.userUSrvc.readUsersFromDB([]);
        if (Array.isArray(allUsers)) {
            const rolesInfo = await this.rolesUSrvc.getAllRoles();
            if (rolesInfo['ok']) {
                try {
                    const mergedUsersWithQuestions = this.userUSrvc.mergeUsersWithQuestions(allUsers, rolesInfo['data']);
                    return { ok: true, data: mergedUsersWithQuestions };
                }
                catch (e) {
                    this.logger.info('An error occured while merging users with their role specific questions');
                    this.logger.error(e);
                    return { ok: false, status: 500, error: 'An unexpected error occured while merging users, try again later' };
                }
            }
            else {
                return { ok: false, status: rolesInfo['status'], error: rolesInfo['error'] };
            }
        }
        else {
            return { ok: false, status: allUsers['status'] || 500, error: allUsers['error'] || 'An unexpected error while reading all users' };
        }
    }
};
UserService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, auth_service_1.AuthService,
        user_utility_service_1.UserUtilityService,
        roles_utility_service_1.RolesUtilityService])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map