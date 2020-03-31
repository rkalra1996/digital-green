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
let PipelineUtilityService = class PipelineUtilityService {
    constructor(logger, SessionModel) {
        this.logger = logger;
        this.SessionModel = SessionModel;
    }
    updateSessionTopicInDB(userInfoObj, dataToAdd) {
        this.logger.info('recieved data to update in database as ' + JSON.stringify(dataToAdd));
        return new Promise((res, rej) => {
            if (userInfoObj['session_id'] && userInfoObj['username'] && userInfoObj['topic_name']) {
                this.logger.info(`saving data for session id ', ${userInfoObj['session_id']}`);
                this.SessionModel.findOne({ username: userInfoObj['username'], session_id: userInfoObj['session_id'] }).then(data => {
                    const selectedTopicIdx = data['topics'].findIndex(topic => topic['topic_name'] === userInfoObj['topic_name']);
                    if (selectedTopicIdx > -1) {
                        const newTopic = Object.assign(Object.assign({}, data['topics'][selectedTopicIdx]), dataToAdd);
                        data['topics'][selectedTopicIdx] = newTopic;
                        this.SessionModel.updateOne({ session_id: userInfoObj['session_id'] }, { topics: data['topics'] })
                            .then(updateRes => {
                            this.logger.info(`update res , ${JSON.stringify(updateRes)}`);
                            res(true);
                        })
                            .catch(updateErr => {
                            this.logger.info('update Error into the database');
                            this.logger.error(updateErr);
                            rej('An error occured while saving the updated topic details');
                        });
                    }
                    else {
                        this.logger.error('did not find the topic which needs to be updated');
                    }
                }).catch(findErr => {
                    this.logger.info('error while getting topics using session id ');
                    this.logger.error(findErr);
                    rej('An error occured while finding topic using the session id');
                });
            }
            else {
                this.logger.error('session id not available inside user object while updating in sessionDB');
                rej('session id not available inside user object while updating in sessionDB');
            }
        });
    }
    updateSessionTopicStatusFailure(userObj, dataToAdd) {
        this.logger.info('data recieved to update failure status in db -->' + JSON.stringify(dataToAdd));
        return new Promise((res, rej) => {
            this.updateSessionTopicInDB(userObj, dataToAdd)
                .then(updated => {
                res({ ok: updated });
            })
                .catch(updateErr => {
                res({ ok: false, error: updateErr });
            });
        });
    }
};
PipelineUtilityService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __param(1, mongoose_1.InjectModel('sessions')),
    __metadata("design:paramtypes", [Object, mongoose_2.Model])
], PipelineUtilityService);
exports.PipelineUtilityService = PipelineUtilityService;
//# sourceMappingURL=pipeline-utility.service.js.map