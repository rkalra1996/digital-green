import { JwtPayload } from './interfaces/jwt-payload';
declare const JwtStrategy_base: new (...args: any[]) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): Promise<{
        userId: any;
        email: string;
        username: string;
    }>;
}
export {};
