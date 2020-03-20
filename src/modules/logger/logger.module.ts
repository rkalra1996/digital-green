import { Module } from '@nestjs/common';
import {WinstonModule} from 'nest-winston';
import * as winston from 'winston';
import {env as ENV} from 'process';
import { UniversalLoggerService } from './services/universal-logger/universal-logger.service';

@Module({
  providers: [UniversalLoggerService],
    imports: [
        WinstonModule.forRoot({
            exitOnError: false,
            transports: [
            new winston.transports.File({
              level: 'error',
              filename: ENV.DG_STAGING_ERROR_LOGS_PATH,
              // format: winston.format.json(),
            }),
            new winston.transports.File({
              level: 'info',
              filename: ENV.DG_STAGING_COMBINED_LOGS_PATH,
              // format: winston.format.json(),
            }),
            new winston.transports.Console({
              level: 'info',
              format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple(),
            ),
            }),
          ],
          exceptionHandlers: [
            new winston.transports.File({ filename: ENV.DG_STAGING_ERROR_LOGS_PATH }),
          ],
        }),
    ],
    exports : [UniversalLoggerService],
})
export class LoggerModule {}
