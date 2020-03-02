import { Injectable } from '@nestjs/common';
import { SessionsUtilityService } from '../../../sessions/services/sessions-utility/sessions-utility.service';
import { PipelineCoreService } from './../../../pipeline/services/pipeline-core/pipeline-core.service';

@Injectable()
export class GoogleCloudWebhookHandlerService {

    constructor(
        private readonly sessionUtilitySrvc: SessionsUtilityService,
        private readonly pipelineSrvc: PipelineCoreService,
        ) {}

    handleWebhookEvent(webhookData): Promise<object> {
        return new Promise((resolve, reject) => {
            // get the session username , session id, topic name from the file name and update it accordingly
            const fileInfo = this.getFileInfo(webhookData);
            console.log(fileInfo);
            this.sessionUtilitySrvc.updateSessionFileStatus(fileInfo)
            .then(response => {
                console.log('file record updated in the session collection successfully');
                resolve({ok: true});
                // start the pipeline
                this.pipelineSrvc.initiate(response.data);
            })
            .catch(error => {
                console.log(error['error']);
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
}
