import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { PipelineUtilityService } from '../pipeline-utility/pipeline-utility.service';
export declare class PipelineCoreService {
    private readonly gcloudCore;
    private readonly pipelineUtility;
    constructor(gcloudCore: GcloudService, pipelineUtility: PipelineUtilityService);
    initiate(initialData: any): void;
}
