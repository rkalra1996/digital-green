import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

// connecting data base
import {MongooseModule} from '@nestjs/mongoose';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SharedService } from './services/shared/shared.service';
import { PathResolverService } from './services/path-resolver/path-resolver.service';
import { FfmpegUtilityService } from './services/ffmpeg-utility/ffmpeg-utility.service';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost/digital_green', {useNewUrlParser: true, useUnifiedTopology: true, reconnectTries: 2}),
    UsersModule,
    SessionsModule,
    WebhooksModule],
  controllers: [AppController],
  providers: [PathResolverService, AppService, SharedService, FfmpegUtilityService],
  exports: [SharedService, PathResolverService, FfmpegUtilityService],
})
export class AppModule {}
