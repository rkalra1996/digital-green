import { Controller, Post, Body, Res } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post('register')
    async registerUser(@Body() requestBody, @Res() response): Promise<any> {
        console.log('POST user/register');
        const isRegistered = await this.userService.register(requestBody);
        if (!isRegistered['ok']) {
            return response.status(isRegistered['status']).send({status: isRegistered['status'], error: isRegistered['error']});
        }
        return response.status(200).send(isRegistered['data']);
    }

    @Post('login')
    async userUser(@Body() requestBody, @Res() response): Promise<any> {
        console.log('POST user/login');
        const loggedIn = await this.userService.login(requestBody.username, requestBody.password);
        if (!loggedIn['ok']) {
            return response.status(loggedIn['status']).send({status: loggedIn['status'], error: loggedIn['error']});
        }
        return response.status(200).send(loggedIn['data']);
    }
}
