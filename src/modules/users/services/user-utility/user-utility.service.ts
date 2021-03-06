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

    validateNewUser(userObj) {
        if (userObj && userObj.constructor === Object && Object.keys(userObj).length) {
            if (userObj.hasOwnProperty('username') && userObj.hasOwnProperty('password') && userObj.hasOwnProperty('role')) {
                if (userObj.username && userObj.password) {
                    return {ok: true};
                }
                return {ok: false, error: 'Either of username ,role or password key is empty'};
            }
            return {ok: false, error: 'Either of username, role or password is missing'};
        }
    }

    getParsedNewUsers(userBody) {
        console.log('parsing ', userBody);
        userBody.users = userBody.users.map(user => {
            if (!user.hasOwnProperty('name')) {
                user['name'] = user.username;
            }
            if (!user.hasOwnProperty('email')) {
                user['email'] = `${user.username}@xyz.com`;
            }
            return user;
        });
        // console.log('returning parsed users as ', userBody);
        return userBody;
    }

    /**
     * Validates and parse new users. The function will first validate all the users present in the object and then parse them accordingly
     * @param userBody
     * @returns newUsers Array
     */
    validateAndParseNewUsers(userBody) {
        if (userBody && userBody.constructor === Object) {
            if (Object.keys(userBody).length > 0) {
                if (userBody.hasOwnProperty('users') && Array.isArray(userBody.users) && userBody.users.length > 0) {
                    try {
                        userBody.users.every((newUserObject,index) => {
                            const response = this.validateNewUser(newUserObject);
                            if (!response['ok']) {
                                console.log('validation failed for some new user', newUserObject);
                                throw new Error(response['error'] + '@@' + index);
                            }
                            return response;
                        });
                        const parsedUsers = this.getParsedNewUsers(userBody);
                        return {ok: true, users: parsedUsers.users};
                    } catch (validationErr) {
                        return {ok: false, status: 400, error: `${validationErr['message'].split('@@')[0]} at index ${validationErr['message'].split('@@')[1]}`};
                    }
                } else {
                    return {ok: false, status: 400, error: 'users key inside users body is either not of array type / empty / does not exist'};
                }
            } else {
                return {ok: false, status: 400, error: 'new users body object cannot be empty'};
            }
        } else {
            return {ok: false, status: 400, error: 'new users body is not of type object'};
        }
    }

    async registerUsers(newUsers) {
        console.log('going to register ', newUsers);
        return new Promise((insertRes, insertRej) => {
            this.UserModel.insertMany(newUsers)
            .then(inserted => {
                console.log('new users inserted ', inserted);
                insertRes({ok: true, users: inserted});
            })
            .catch(insertErr => {
                if (insertErr.code.toString() === '11000' && insertErr.name.toString().toLowerCase() === 'bulkwriteerror') {
                    console.log('duplicae user insert error');
                    insertRes({ok: false, status: 400, error: 'Error occured while inserting users. One or more users are already registered with same username'});
                } else {
                    console.log('An error detected while inserting users', insertErr);
                    insertRes({ok: false, status: 500, error: 'Error occured while inserting users'});
                }
            });
        });
    }
}
