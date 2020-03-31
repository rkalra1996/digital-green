"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const sessions_module_1 = require("./modules/sessions/sessions.module");
const shared_service_1 = require("./services/shared/shared.service");
const path_resolver_service_1 = require("./services/path-resolver/path-resolver.service");
const ffmpeg_utility_service_1 = require("./services/ffmpeg-utility/ffmpeg-utility.service");
const webhooks_module_1 = require("./modules/webhooks/webhooks.module");
const mongoose_1 = require("@nestjs/mongoose");
const process_1 = require("process");
const health_module_1 = require("./modules/health/health.module");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
require("winston-daily-rotate-file");
const roles_module_1 = require("./modules/roles/roles.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const errorStackFormat = winston.format(info => {
    if (info instanceof Error) {
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message,
        });
    }
    return info;
});
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            nest_winston_1.WinstonModule.forRoot({
                exitOnError: false,
                format: winston.format.combine(errorStackFormat(), winston.format.timestamp(), winston.format.json()),
                transports: [
                    new (winston.transports.DailyRotateFile)({
                        level: 'error',
                        filename: process_1.env.DG_ERROR_LOGS_DIR + '%DATE%_' + process_1.env.DG_ERROR_LOG_FILENAME,
                        datePattern: 'DD-MM-YYYY',
                        maxSize: '20m',
                    }),
                    new (winston.transports.DailyRotateFile)({
                        level: 'info',
                        filename: process_1.env.DG_COMBINED_LOGS_DIR + '%DATE%_' + process_1.env.DG_COMBINED_LOG_FILENAME,
                        datePattern: 'DD-MM-YYYY',
                        maxSize: '20m',
                    }),
                    new winston.transports.Console({
                        level: 'info',
                        format: winston.format.combine(winston.format.colorize(), winston.format.timestamp(), winston.format.simple()),
                    }),
                ],
                exceptionHandlers: [
                    new (winston.transports.DailyRotateFile)({
                        filename: process_1.env.DG_ERROR_LOGS_DIR + '%DATE%_' + process_1.env.DG_ERROR_LOG_FILENAME,
                        datePattern: 'DD-MM-YYYY',
                    }),
                ],
            }),
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            mongoose_1.MongooseModule.forRoot(process_1.env.DG_DB_HOST, { useNewUrlParser: true, useUnifiedTopology: true }),
            users_module_1.UsersModule,
            sessions_module_1.SessionsModule,
            webhooks_module_1.WebhooksModule,
            dashboard_module_1.DashboardModule,
            roles_module_1.RolesModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [path_resolver_service_1.PathResolverService, app_service_1.AppService, shared_service_1.SharedService, ffmpeg_utility_service_1.FfmpegUtilityService],
        exports: [shared_service_1.SharedService, path_resolver_service_1.PathResolverService, ffmpeg_utility_service_1.FfmpegUtilityService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map