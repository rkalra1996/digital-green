import { Module } from '@nestjs/common';
import { SessionsController } from './controllers/sessions/sessions.controller';
import {MongooseModule} from '@nestjs/mongoose';
import { SessionSchema } from './schemas/sessions.schema';
import { SessionsService } from './services/sessions/sessions.service';
import { SessionsUtilityService } from './services/sessions-utility/sessions-utility.service';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'sessions', schema: SessionSchema}]),
        UsersModule],
    providers: [SessionsService, SessionsUtilityService],
    controllers: [SessionsController],
})
export class SessionsModule {}
