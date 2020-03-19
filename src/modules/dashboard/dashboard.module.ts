import { Module } from '@nestjs/common';
import { DashboardCoreService } from './service/dashboard-core/dashboard-core.service';
import { DashboardController } from './controller/dashboard/dashboard.controller';

@Module({
    providers: [DashboardCoreService],
    controllers: [DashboardController],
})
export class DashboardModule {}
