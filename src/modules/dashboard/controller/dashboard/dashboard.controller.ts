import { Controller, Get, Res, Inject } from '@nestjs/common';
import { DashboardCoreService } from '../../service/dashboard-core/dashboard-core.service';
import { Logger } from 'winston';

@Controller('dashboard')
export class DashboardController {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly dashboardCore: DashboardCoreService,
    ) {}

    @Get('get-report')
    async getDatabaseReport(@Res() response): Promise<any> {
        this.logger.info('GET /dashboard/get-report');
        const reportData = await this.dashboardCore.generateReport();
        if (reportData['ok']) {
            response.status(200).send({ok: true, data: reportData['data']});
        } else {
            response.status(reportData['status']).send({status: reportData['status'], error: reportData['error']});
        }
    }
}
