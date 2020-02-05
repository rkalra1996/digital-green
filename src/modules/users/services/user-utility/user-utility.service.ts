import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type User = any;

@Injectable()
export class UserUtilityService {
    constructor(@InjectModel('User') private readonly UserModel: Model<User>) { }

    async findUserByUsername(username: string): Promise<User | undefined> {
        return new Promise((resolve, reject) => {
            this.UserModel.findOne({ username })
            .then(userFound => {
                if (userFound === null) {
                    // no such user exists
                    resolve({});
                } else {
                    resolve(userFound);
                }
            })
            .catch(err => {
                console.log('An error occured while retriving user for login', err);
                resolve(null);
            });
        });
    }

    async userExists(username: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.findUserByUsername(username).then(user => {
                if (user === null) {
                    resolve(null);
                }
                if (user && Object.keys(user).length > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.findUserByUsername(username);
        if (user && Object.keys(user).length === 0) {
            // no user found
            return { ok: false, status: 401, error: 'NO SUCH USER EXISTS / UNAUTHORISED' };
        } else if (!user) {
            return { ok: false, status: 500, error: 'An error occured while retrieving user details from DB' };
        } else {
            // check for its password
            if (user.password === pass) {
                return { ok: true, user };
            } else {
                // incorrect password
                return { ok: false, status: 401, error: 'INCORRECT PASSWORD' };
            }
        }
    }
}
