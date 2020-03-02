import { Module } from '@nestjs/common';
import { PipelineCoreService } from './services/pipeline-core/pipeline-core.service';
import { GcloudModule } from '../gcloud/gcloud.module';

@Module({
    imports: [GcloudModule],
    providers: [PipelineCoreService],
    exports: [PipelineCoreService],
})
export class PipelineModule {}
