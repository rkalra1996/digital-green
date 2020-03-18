import { Module } from '@nestjs/common';
import { PipelineCoreService } from './services/pipeline-core/pipeline-core.service';
import { GcloudModule } from '../gcloud/gcloud.module';
import { PipelineUtilityService } from './services/pipeline-utility/pipeline-utility.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionSchema } from '../sessions/schemas/sessions.schema';
import { KeyPhraseModule } from '../key-phrase/key-phrase.module';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'sessions', schema: SessionSchema}]),
        GcloudModule, KeyPhraseModule],
    providers: [PipelineCoreService, PipelineUtilityService],
    exports: [PipelineCoreService],
})
export class PipelineModule {}
