import { SessionsUtilityService } from '../../../sessions/services/sessions-utility/sessions-utility.service';
import { PipelineCoreService } from './../../../pipeline/services/pipeline-core/pipeline-core.service';
import { Logger } from 'winston';
import { SharedService } from './../../../../services/shared/shared.service';
export declare class GoogleCloudWebhookHandlerService {
    private readonly logger;
    private readonly sessionUtilitySrvc;
    private readonly pipelineSrvc;
    private readonly sharedService;
    constructor(logger: Logger, sessionUtilitySrvc: SessionsUtilityService, pipelineSrvc: PipelineCoreService, sharedService: SharedService);
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
    deleteTempFile(fileObj: any): void;
}
