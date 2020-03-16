import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export type Roles =  any;

@Injectable()
export class RolesUtilityService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        @InjectModel('roles') private readonly RolesModel: Model<Roles>,
        ) {}

    validateAndParseBody(body) {
        if (body) {
            if (body.constructor === Object && body.hasOwnProperty('roles')) {
                if (Array.isArray(body.roles)) {
                    let errorRole = null;
                    body.roles.every((role, roleIdx) => {
                        if (role && role.constructor === 'string') {
                            return true;
                        } else {
                            errorRole = roleIdx;
                            return false;
                        }
                    });
                    if (errorRole !== null) {
                        return {ok: false, error: `roles array key at index ${errorRole} in not a proper string`};
                    } else {
                        return {ok: true, roles: body.roles.map(role => role.toLowerCase())};
                    }
                } else {
                    return {ok: false, error: 'roles key is not of type array'};
                }
            } else {
                return {ok: false, error: 'Body object does not contain roles key'};
            }
        } else {
            this.logger.info('empty body supplied, all roles will be fetched');
            return {ok: true, roles: []};
        }
    }

    getAllRoles(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.RolesModel.find().then(roles => {
                if (roles) {
                    this.logger.info(`roles found in db are ${JSON.stringify(roles)}`);
                    resolve({ok: true, data: roles});
                } else {
                    this.logger.info(`roles doesn't seem to be existing in db ${roles}`);
                    if (roles === null) {
                        // no roles in db
                        this.logger.info(`no roles present in the database`);
                        resolve({ok: true, data: []});
                    } else {
                        this.logger.error('unexpected response from mongodb, marking as error');
                        this.logger.error(roles);
                        const err = 'Unexpected error occured, try again later';
                        resolve({ok: false, data: null, status: 500, error: err});
                    }
                }
            }).catch(dbErr => {
                const err = 'An error occured while getting roles from the database';
                this.logger.error(err);
                this.logger.error(dbErr);
                resolve({ok: false, status: 500, error: err});
            });
        });
    }

    getUserRole(rolesToFetch) {}
}
