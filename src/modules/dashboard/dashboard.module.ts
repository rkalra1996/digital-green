import { Module } from '@nestjs/common';
import { DashboardCoreService } from './service/dashboard-core/dashboard-core.service';
import { DashboardController } from './controller/dashboard/dashboard.controller';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { SessionsUtilityService } from '../sessions/services/sessions-utility/sessions-utility.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from '../sessions/schemas/sessions.schema';
import { DashboardUtilityService } from './service/dashboard-utility/dashboard-utility.service';
import { UserUtilityService } from '../users/services/user-utility/user-utility.service';
import { UsersSchema } from '../users/schemas/users.schema';
import { UserSchema } from '../users/schemas/user.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'sessions', schema: SessionSchema}]),
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Users', schema: UsersSchema}]),
        UsersModule,
        SessionsModule,
    ],
    providers: [DashboardCoreService, SessionsUtilityService, UserUtilityService, DashboardUtilityService],
    controllers: [DashboardController],
})
export class DashboardModule {}
