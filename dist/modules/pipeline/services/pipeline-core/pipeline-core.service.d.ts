import { GcloudService } from './../../../gcloud/services/gcloud/gcloud.service';
import { PipelineUtilityService } from '../pipeline-utility/pipeline-utility.service';
import { Logger } from 'winston';
import { KeyPhraseCoreService } from 'src/modules/key-phrase/services/key-phrase-core/key-phrase-core.service';
export declare class PipelineCoreService {
    private readonly logger;
    private readonly gcloudCore;
    private readonly keyPhraseCore;
    private readonly pipelineUtility;
    constructor(logger: Logger, gcloudCore: GcloudService, keyPhraseCore: KeyPhraseCoreService, pipelineUtility: PipelineUtilityService);
    initiate(initialData: any): void;
}
