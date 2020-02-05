import { Module } from '@nestjs/common';
import { SessionsController } from './controllers/sessions/sessions.controller';
import {MongooseModule} from '@nestjs/mongoose';
import { SessionSchema } from './schemas/sessions.schema';
import { SessionsService } from './services/sessions/sessions.service';
import { SessionsUtilityService } from './services/sessions-utility/sessions-utility.service';
import { UsersModule } from '../users/users.module';
import { SharedService } from './../../services/shared/shared.service';
import { PathResolverService } from 'src/services/path-resolver/path-resolver.service';
import { GcloudModule } from '../gcloud/gcloud.module';
import { FfmpegUtilityService } from '../../services/ffmpeg-utility/ffmpeg-utility.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'sessions', schema: SessionSchema}]),
        UsersModule, GcloudModule],
    providers: [SessionsService, SessionsUtilityService, SharedService, PathResolverService, FfmpegUtilityService],
    controllers: [SessionsController],
})
export class SessionsModule {}
