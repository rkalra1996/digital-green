"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
const process_1 = require("process");
const universal_logger_service_1 = require("./services/universal-logger/universal-logger.service");
let LoggerModule = class LoggerModule {
};
LoggerModule = __decorate([
    common_1.Module({
        providers: [universal_logger_service_1.UniversalLoggerService],
        imports: [
            nest_winston_1.WinstonModule.forRoot({
                exitOnError: false,
                transports: [
                    new winston.transports.File({
                        level: 'error',
                        filename: process_1.env.DG_ERROR_LOGS_PATH,
                    }),
                    new winston.transports.File({
                        level: 'info',
                        filename: process_1.env.DG_COMBINED_LOGS_PATH,
                    }),
                    new winston.transports.Console({
                        level: 'info',
                        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
                    }),
                ],
                exceptionHandlers: [
                    new winston.transports.File({ filename: process_1.env.DG_ERROR_LOGS_PATH }),
                ],
            }),
        ],
        exports: [universal_logger_service_1.UniversalLoggerService],
    })
], LoggerModule);
exports.LoggerModule = LoggerModule;
//# sourceMappingURL=logger.module.js.map