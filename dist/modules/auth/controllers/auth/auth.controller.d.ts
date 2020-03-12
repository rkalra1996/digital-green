import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly jwtSrvc;
    constructor(jwtSrvc: JwtService);
    validateToken(response: any, params: any): Promise<any>;
}
