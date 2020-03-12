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
const jwt_1 = require("@nestjs/jwt");
let AuthController = class AuthController {
    constructor(jwtSrvc) {
        this.jwtSrvc = jwtSrvc;
    }
    async validateToken(response, params) {
        try {
            this.jwtSrvc.verify(params.jwtToken);
            const payload = this.jwtSrvc.decode(params.jwtToken);
            return response.status(200).send({ status: 200, message: 'token is valid', payload });
        }
        catch (e) {
            return response.status(200).send({ status: 200, message: 'token is invalid' });
        }
    }
};
__decorate([
    common_1.Get('validate-token/:jwtToken'),
    __param(0, common_1.Res()), __param(1, common_1.Param()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
AuthController = __decorate([
    common_1.Controller('auth'),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map