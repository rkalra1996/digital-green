import { Injectable } from '@nestjs/common';
import { AuthService } from './../../../auth/services/auth/auth.service';

export type User = any;

@Injectable()
export class UserService {
    private readonly users: User[];

    constructor(
      private readonly authSrvc: AuthService) {
        this.users = [
            {
                userId: 1,
                username: 'john',
                email: 'john@abc.com',
                password: 'changeme',
              },
              {
                userId: 2,
                username: 'chris',
                email: 'chris@cbv.com',
                password: 'secret',
              },
              {
                userId: 3,
                username: 'maria',
                email: 'maria@hello.com',
                password: 'guess',
              },
        ];
    }

    async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
    }

    async validateUser(username: string, pass: string): Promise<any> {
      const user = await this.findOne(username);
      if (user && user.password === pass) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    /**
     * @description This function will internally check if the user exists and returns access token
     * @param username string
     * @param password string
     * @returns object containing access_token
     */
    async login(username: string, password: string): Promise<any> {
      const user = await this.validateUser(username, password);
      if (user) {
        // get the access token
        const tokenData = await this.authSrvc.login({username: user.username, sub: user.userId, email: user.email});
        return Promise.resolve({ok: true, data: tokenData});
      } else {
        return Promise.resolve({ok: false, status: 401, error: 'UNAUTHORISED USER'});
      }
    }
}
