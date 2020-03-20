import { Controller, Post, Body, Res, Get, Inject, UseGuards } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';

import {Logger} from 'winston';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly userService: UserService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('register')
    async registerUser(@Body() requestBody, @Res() response): Promise<any> {
        this.logger.info('POST user/register');
        const isRegistered = await this.userService.register(requestBody);
        if (!isRegistered['ok']) {
            this.logger.info('returning response as ' + JSON.stringify(isRegistered));
            return response.status(isRegistered['status']).send({status: isRegistered['status'], error: isRegistered['error']});
        }
        return response.status(200).send(isRegistered['data']);
    }

    @Post('login')
    async userUser(@Body() requestBody, @Res() response): Promise<any> {
        this.logger.info('POST user/login');
        const loggedIn = await this.userService.login(requestBody.username, requestBody.password);
        if (!loggedIn['ok']) {
            return response.status(loggedIn['status']).send({status: loggedIn['status'], error: loggedIn['error']});
        }
        return response.status(200).send(loggedIn['data']);
    }

    @Post('list')
    async listAllUsers(@Res() response, @Body() body): Promise<any> {
        this.logger.info('GET /user/list hit');
        const users = await this.userService.readAllUsers(body);
        if (users['ok']) {
            this.logger.info('sending abck users list as ' + JSON.stringify(users));
            return response.status(200).send({status: 200, users: users['data']});
        } else {
            this.logger.error('detected err while reading allusers api' + JSON.stringify(users));
            return response.status(users['status']).send({status: users['status'], error: users['error']});
        }
    }
}
