import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

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
