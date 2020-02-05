import { Module } from '@nestjs/common';
import { GcloudService } from './services/gcloud/gcloud.service';
import { GcloudUtilityService } from './services/gcloud-utility/gcloud-utility.service';

@Module({
    providers: [GcloudService, GcloudUtilityService],
    exports: [GcloudService],
})
export class GcloudModule {}
