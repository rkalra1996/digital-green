import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SharedService } from './services/shared/shared.service';
import { PathResolverService } from './services/path-resolver/path-resolver.service';
import { FfmpegUtilityService } from './services/ffmpeg-utility/ffmpeg-utility.service';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

// connecting data base
import {MongooseModule} from '@nestjs/mongoose';

// importing environments
import {env as ENV} from 'process';
// health module for apis
import { HealthModule } from './modules/health/health.module';
// logger for application
// import { LoggerModule } from './modules/logger/logger.module';
import {WinstonModule} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const errorStackFormat = winston.format(info => {
  if (info instanceof Error) {
    return Object.assign({}, info, {
      stack: info.stack,
      message: info.message,
    });
  }
  return info;
});

@Module({
  imports: [
    WinstonModule.forRoot({
      exitOnError: false,
      format: winston.format.combine(
        errorStackFormat(),
        winston.format.timestamp(),
        winston.format.json()),
      transports: [
      new (winston.transports.DailyRotateFile)({
        level: 'error',
        filename: ENV.DG_ERROR_LOGS_DIR + '%DATE%_' + ENV.DG_ERROR_LOG_FILENAME,
        datePattern: 'DD-MM-YYYY',
        maxSize: '20m',
      }),
      new (winston.transports.DailyRotateFile)({
        level: 'info',
        filename: ENV.DG_COMBINED_LOGS_DIR + '%DATE%_' + ENV.DG_COMBINED_LOG_FILENAME,
        datePattern: 'DD-MM-YYYY',
        maxSize: '20m',
      }),
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.simple(),
      ),
      }),
    ],
    exceptionHandlers: [
      new (winston.transports.DailyRotateFile)({
        filename: ENV.DG_ERROR_LOGS_DIR + '%DATE%_' + ENV.DG_ERROR_LOG_FILENAME,
        datePattern: 'DD-MM-YYYY',
       }),
    ],
  }),
    // LoggerModule,
    HealthModule,
    AuthModule,
    MongooseModule.forRoot(ENV.DG_DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true}),
    UsersModule,
    SessionsModule,
    WebhooksModule],
  controllers: [AppController],
  providers: [PathResolverService, AppService, SharedService, FfmpegUtilityService],
  exports: [SharedService, PathResolverService, FfmpegUtilityService],
})
export class AppModule {}
