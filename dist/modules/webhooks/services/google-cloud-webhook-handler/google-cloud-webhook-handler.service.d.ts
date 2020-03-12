import { SessionsUtilityService } from '../../../sessions/services/sessions-utility/sessions-utility.service';
import { PipelineCoreService } from './../../../pipeline/services/pipeline-core/pipeline-core.service';
export declare class GoogleCloudWebhookHandlerService {
    private readonly sessionUtilitySrvc;
    private readonly pipelineSrvc;
    constructor(sessionUtilitySrvc: SessionsUtilityService, pipelineSrvc: PipelineCoreService);
    handleWebhookEvent(webhookData: any): Promise<object>;
    getFileInfo(fileData: any): {
        bucketname: any;
        username: any;
        sessionID: any;
        topicName: any;
        filename: any;
        gsURI: any;
        mediaSize: any;
        uploadedOn: any;
        modifiedOn: any;
    };
}
