"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const sessions_controller_1 = require("./controllers/sessions/sessions.controller");
const mongoose_1 = require("@nestjs/mongoose");
const sessions_schema_1 = require("./schemas/sessions.schema");
const sessions_service_1 = require("./services/sessions/sessions.service");
const sessions_utility_service_1 = require("./services/sessions-utility/sessions-utility.service");
const users_module_1 = require("../users/users.module");
const shared_service_1 = require("./../../services/shared/shared.service");
const path_resolver_service_1 = require("../../services/path-resolver/path-resolver.service");
const gcloud_module_1 = require("../gcloud/gcloud.module");
const ffmpeg_utility_service_1 = require("../../services/ffmpeg-utility/ffmpeg-utility.service");
let SessionsModule = class SessionsModule {
};
SessionsModule = __decorate([
    common_1.Module({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: 'sessions', schema: sessions_schema_1.SessionSchema }]),
            users_module_1.UsersModule, gcloud_module_1.GcloudModule
        ],
        providers: [sessions_service_1.SessionsService, sessions_utility_service_1.SessionsUtilityService, shared_service_1.SharedService, path_resolver_service_1.PathResolverService, ffmpeg_utility_service_1.FfmpegUtilityService],
        controllers: [sessions_controller_1.SessionsController],
        exports: [sessions_utility_service_1.SessionsUtilityService],
    })
], SessionsModule);
exports.SessionsModule = SessionsModule;
//# sourceMappingURL=sessions.module.js.map