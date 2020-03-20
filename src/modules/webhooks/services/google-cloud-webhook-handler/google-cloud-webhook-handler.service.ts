import { Injectable, Inject } from '@nestjs/common';
import { SessionsUtilityService } from '../../../sessions/services/sessions-utility/sessions-utility.service';
import { PipelineCoreService } from './../../../pipeline/services/pipeline-core/pipeline-core.service';
import { Logger } from 'winston';
import { SharedService } from './../../../../services/shared/shared.service';

@Injectable()
export class GoogleCloudWebhookHandlerService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly sessionUtilitySrvc: SessionsUtilityService,
        private readonly pipelineSrvc: PipelineCoreService,
        private readonly sharedService: SharedService
        ) {}

    handleWebhookEvent(webhookData): Promise<object> {
        return new Promise((resolve, reject) => {
            // get the session username , session id, topic name from the file name and update it accordingly
            const fileInfo = this.getFileInfo(webhookData);
            this.logger.info(fileInfo);
            this.sessionUtilitySrvc.updateSessionFileStatus(fileInfo)
            .then(response => {
                this.logger.info('file record updated in the session collection successfully');
                // delete the temp store file saved, as it is no longer needed
                this.deleteTempFile(fileInfo);
                resolve({ok: true});
                // start the pipeline
                this.pipelineSrvc.initiate(response.data);
            })
            .catch(error => {
                this.logger.error(error['error']);
                reject({ok: false, error: error['error']});
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
}
