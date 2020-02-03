import { Module } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { JwtModule} from '@nestjs/jwt';
import {jwtConstants} from './strategies/constants/jwt-constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth/auth.controller';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({secret: jwtConstants.secret}),
    ],
    providers: [AuthService, JwtStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
