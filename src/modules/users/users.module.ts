import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';

// mongoose schemas
import {UserSchema} from './schemas/user.schema';
import { UserUtilityService } from './services/user-utility/user-utility.service';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    ],
    controllers: [UserController],
    providers: [UserService, UserUtilityService],
    exports: [UserService],
})
export class UsersModule {}
