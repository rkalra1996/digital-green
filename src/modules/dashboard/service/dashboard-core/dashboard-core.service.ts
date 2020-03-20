import { Injectable, Inject } from '@nestjs/common';
import { SessionsUtilityService } from './../../../sessions/services/sessions-utility/sessions-utility.service';
import { Logger } from 'winston';
import { DashboardUtilityService } from '../dashboard-utility/dashboard-utility.service';

@Injectable()
export class DashboardCoreService {

    constructor(
        @Inject('winston') private readonly logger: Logger,
        private readonly sessionUtSrvc: SessionsUtilityService,
        private readonly dashbordUtilitySrvc: DashboardUtilityService,
    ) {}

    async generateReport() {
        const reportData = {};
        const databaseSessions = await this.sessionUtSrvc.getSessionList();
        if (databaseSessions) {
            reportData['totalSessions'] = databaseSessions['length'];
            const completionInfo = this.dashbordUtilitySrvc.sessionsCompletedTillDate(databaseSessions);
            reportData['Sessions_completed_till_date'] = completionInfo['completed'];
            reportData['Sessions_incomplete_till_date'] = completionInfo['incomplete'];
            reportData['pipeline_information'] = this.dashbordUtilitySrvc.pipelineFailureInfo(databaseSessions);
            return {ok: true, data: reportData};
        } else {
            return {ok: false, status: 500, error: 'Failed to generate report, try again later'};
        }
    }
}
