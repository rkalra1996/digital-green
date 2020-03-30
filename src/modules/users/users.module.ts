import { Module } from '@nestjs/common';
import { UserService } from './services/user/user.service';
import { UserController } from './controllers/user/user.controller';
import { AuthModule } from '../auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserUtilityService } from './services/user-utility/user-utility.service';

// mongoose schemas
import {UserSchema} from './schemas/user.schema';
import { UsersSchema } from './schemas/users.schema';
import { RolesModule } from '../roles/roles.module';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
        MongooseModule.forFeature([{name: 'Users', schema: UsersSchema}]),
        RolesModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserUtilityService],
    exports: [UserService, UserUtilityService],
})
export class UsersModule {}
