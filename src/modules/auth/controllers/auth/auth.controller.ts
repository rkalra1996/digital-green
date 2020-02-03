import { Controller, Post, Res, Param, Get } from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(private readonly jwtSrvc: JwtService) {}

    @Get('validate-token/:jwtToken')
    async validateToken(@Res() response, @Param() params): Promise<any> {
        try {
            this.jwtSrvc.verify(params.jwtToken);
            return response.status(200).send({status: 200, message: 'token is valid'});
        } catch (e) {
            return response.status(200).send({status: 200, message: 'token is invalid'});
        }
    }
}
