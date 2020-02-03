import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserUtilityService } from 'src/modules/users/services/user-utility/user-utility.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userUSrvc: UserUtilityService) {
        super();
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.userUSrvc.validateUser(username, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}