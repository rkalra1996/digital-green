"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let UserUtilityService = class UserUtilityService {
    constructor(logger, UserModel, UsersModel) {
        this.logger = logger;
        this.UserModel = UserModel;
        this.UsersModel = UsersModel;
    }
    async findUserByUsername(username) {
        return new Promise((resolve, reject) => {
            this.UserModel.findOne({ username })
                .then(userFound => {
                if (userFound === null) {
                    resolve({});
                }
                else {
                    resolve(userFound);
                }
            })
                .catch(err => {
                console.log('An error occured while retriving user for login', err);
                resolve(null);
            });
        });
    }
    async userExists(username) {
        return new Promise(async (resolve, reject) => {
            this.findUserByUsername(username).then(user => {
                if (user === null) {
                    resolve(null);
                }
                if (user && Object.keys(user).length > 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            });
        });
    }
    async validateUser(username, pass) {
        const user = await this.findUserByUsername(username);
        if (user && Object.keys(user).length === 0) {
            return { ok: false, status: 401, error: 'NO SUCH USER EXISTS / UNAUTHORISED' };
        }
        else if (!user) {
            return { ok: false, status: 500, error: 'An error occured while retrieving user details from DB' };
        }
        else {
            if (user.password === pass) {
                return { ok: true, user };
            }
            else {
                return { ok: false, status: 401, error: 'INCORRECT PASSWORD' };
            }
        }
    }
    validateNewUser(userObj) {
        if (userObj && userObj.constructor === Object && Object.keys(userObj).length) {
            if (userObj.hasOwnProperty('username') && userObj.hasOwnProperty('password') && userObj.hasOwnProperty('role')) {
                if (userObj.username && userObj.password) {
                    return { ok: true };
                }
                return { ok: false, error: 'Either of username ,role or password key is empty' };
            }
            return { ok: false, error: 'Either of username, role or password is missing' };
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
        return userBody;
    }
    validateAndParseNewUsers(userBody) {
        if (userBody && userBody.constructor === Object) {
            if (Object.keys(userBody).length > 0) {
                if (userBody.hasOwnProperty('users') && Array.isArray(userBody.users) && userBody.users.length > 0) {
                    try {
                        userBody.users.every((newUserObject, index) => {
                            const response = this.validateNewUser(newUserObject);
                            if (!response['ok']) {
                                console.log('validation failed for some new user', newUserObject);
                                throw new Error(response['error'] + '@@' + index);
                            }
                            return response;
                        });
                        const parsedUsers = this.getParsedNewUsers(userBody);
                        return { ok: true, users: parsedUsers.users };
                    }
                    catch (validationErr) {
                        return { ok: false, status: 400, error: `${validationErr['message'].split('@@')[0]} at index ${validationErr['message'].split('@@')[1]}` };
                    }
                }
                else {
                    return { ok: false, status: 400, error: 'users key inside users body is either not of array type / empty / does not exist' };
                }
            }
            else {
                return { ok: false, status: 400, error: 'new users body object cannot be empty' };
            }
        }
        else {
            return { ok: false, status: 400, error: 'new users body is not of type object' };
        }
    }
    async registerUsers(newUsers) {
        console.log('going to register ', newUsers);
        return new Promise((insertRes, insertRej) => {
            this.UserModel.insertMany(newUsers)
                .then(inserted => {
                console.log('new users inserted ', inserted);
                insertRes({ ok: true, users: inserted });
            })
                .catch(insertErr => {
                if (insertErr.code.toString() === '11000' && insertErr.name.toString().toLowerCase() === 'bulkwriteerror') {
                    console.log('duplicae user insert error');
                    insertRes({ ok: false, status: 400, error: 'Error occured while inserting users. One or more users are already registered with same username' });
                }
                else {
                    console.log('An error detected while inserting users', insertErr);
                    insertRes({ ok: false, status: 500, error: 'Error occured while inserting users' });
                }
            });
        });
    }
    validateReadUserObj(userObj) {
        return (userObj && userObj.constructor === Object && userObj.hasOwnProperty('username'));
    }
    validateReadAllUsersBody(userBody) {
        if (userBody && userBody.constructor === Object && userBody.hasOwnProperty('users')) {
            if (Array.isArray(userBody.users)) {
                if (userBody.users.length > 0) {
                    let invalidUserObjIdx = -1;
                    userBody.users.every((userObj, i) => {
                        const isvalidatedUserObj = this.validateReadUserObj(userObj);
                        if (isvalidatedUserObj) {
                            return true;
                        }
                        else {
                            this.logger.error('Error while validating user ' + JSON.stringify(userObj));
                            invalidUserObjIdx = i;
                            return false;
                        }
                    });
                    if (invalidUserObjIdx !== -1) {
                        return { ok: false, status: 400, error: 'User object not valid at index ' + invalidUserObjIdx + '. Username key is must' };
                    }
                    else {
                        return { ok: true };
                    }
                }
                else {
                    return { ok: true };
                }
            }
            else {
                return { ok: false, status: 400, error: 'users key must contain atleast one user object with username key' };
            }
        }
        else {
            return { ok: false, status: 400, error: 'body should be of type object and must contain an array key users' };
        }
    }
    parseUserObjForRead(userObj) {
        if (userObj) {
            return userObj['users'];
        }
        else {
            return [];
        }
    }
    readUsersFromDB(usersArray) {
        return new Promise((res, rej) => {
            if (usersArray.length > 1) {
                this.UsersModel.find({
                    $or: [...usersArray],
                }).then(usersDocs => {
                    res(usersDocs);
                })
                    .catch(usersDocsErr => {
                    this.logger.error('An error occured while reading users docs ' + usersDocsErr);
                    rej('An error occured while reading users from DB');
                });
            }
            else {
                this.UserModel.find(usersArray[0])
                    .then(userDoc => {
                    res(userDoc);
                })
                    .catch(userReadErr => {
                    this.logger.error('error while reading single user' + userReadErr);
                    rej('An error occured while reading user from read api');
                });
            }
        });
    }
};
UserUtilityService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __param(1, mongoose_1.InjectModel('User')),
    __param(2, mongoose_1.InjectModel('Users')),
    __metadata("design:paramtypes", [Object, mongoose_2.Model,
        mongoose_2.Model])
], UserUtilityService);
exports.UserUtilityService = UserUtilityService;
//# sourceMappingURL=user-utility.service.js.map