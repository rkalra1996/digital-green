import { Controller, Get, Res, Inject, Query } from '@nestjs/common';
import { DashboardCoreService } from '../../service/dashboard-core/dashboard-core.service';
import { Logger } from 'winston';
import { DashboardUtilityService } from '../../service/dashboard-utility/dashboard-utility.service';

@Controller('dashboard')
export class DashboardController {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly dashboardCore: DashboardCoreService,
        private readonly dashBUtility: DashboardUtilityService,
    ) {}

    @Get('get-report')
    async getDatabaseReport(@Query() queryParams, @Res() response): Promise<any> {
        this.logger.info('GET /dashboard/get-report');
        const dateFilters = this.dashBUtility.parseQueryParamsForDate(queryParams);
        const reportData = await this.dashboardCore.generateReport(queryParams['user'], dateFilters);
        if (reportData['ok']) {
            response.status(200).send({ok: true, data: reportData['data']});
        } else {
            response.status(reportData['status']).send({status: reportData['status'], error: reportData['error']});
        }
    }
}
