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
const sessions_utility_service_1 = require("../../../sessions/services/sessions-utility/sessions-utility.service");
const pipeline_core_service_1 = require("./../../../pipeline/services/pipeline-core/pipeline-core.service");
const shared_service_1 = require("./../../../../services/shared/shared.service");
let GoogleCloudWebhookHandlerService = class GoogleCloudWebhookHandlerService {
    constructor(logger, sessionUtilitySrvc, pipelineSrvc, sharedService) {
        this.logger = logger;
        this.sessionUtilitySrvc = sessionUtilitySrvc;
        this.pipelineSrvc = pipelineSrvc;
        this.sharedService = sharedService;
    }
    handleWebhookEvent(webhookData) {
        return new Promise((resolve, reject) => {
            const fileInfo = this.getFileInfo(webhookData);
            this.logger.info(fileInfo);
            this.sessionUtilitySrvc.updateSessionFileStatus(fileInfo)
                .then(response => {
                this.logger.info('file record updated in the session collection successfully');
                this.deleteTempFile(fileInfo);
                resolve({ ok: true });
                this.pipelineSrvc.initiate(response.data);
            })
                .catch(error => {
                this.logger.error(error['error']);
                reject({ ok: false, error: error['error'] });
            });
        });
    }
    getFileInfo(fileData) {
        const fileInfoArray = fileData['name'].split('/');
        const fileNameInfoArray = fileInfoArray[2].split('_');
        const topicName = fileNameInfoArray[fileNameInfoArray.length - 1].split('.wav')[0];
        const bucketname = fileData['bucket'];
        const username = fileInfoArray[0];
        const sessionID = fileInfoArray[1];
        const filename = fileInfoArray[2];
        const gsURI = fileData['mediaURI'];
        const mediaSize = fileData['size'];
        const uploadedOn = fileData['timeCreated'];
        const modifiedOn = fileData['updated'];
        return {
            bucketname,
            username,
            sessionID,
            topicName,
            filename,
            gsURI,
            mediaSize,
            uploadedOn,
            modifiedOn,
        };
    }
    deleteTempFile(fileObj) {
        this.logger.info('file has been saved properly, now time to delete it from temp store');
        const monofilePath = `${fileObj['username']}/${fileObj['sessionID']}/mono/${fileObj['filename']}`;
        const processedFilePath = `${fileObj['username']}/processed/${fileObj['sessionID']}/${fileObj['filename'].split('mono_')[1]}`;
        this.logger.info('mono file path is ' + monofilePath);
        this.logger.info('processed file path is ' + processedFilePath);
        this.sharedService.deleteFileFromTempStorage(monofilePath);
        this.sharedService.deleteFileFromTempStorage(processedFilePath);
    }
};
GoogleCloudWebhookHandlerService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject('winston')),
    __metadata("design:paramtypes", [Object, sessions_utility_service_1.SessionsUtilityService,
        pipeline_core_service_1.PipelineCoreService,
        shared_service_1.SharedService])
], GoogleCloudWebhookHandlerService);
exports.GoogleCloudWebhookHandlerService = GoogleCloudWebhookHandlerService;
//# sourceMappingURL=google-cloud-webhook-handler.service.js.map