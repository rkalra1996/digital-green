import { SessionsService } from '../../services/sessions/sessions.service';
import { SessionsUtilityService } from '../../services/sessions-utility/sessions-utility.service';
export declare class SessionsController {
    private readonly sessionsSrvc;
    private readonly sessionsUSrvc;
    constructor(sessionsSrvc: SessionsService, sessionsUSrvc: SessionsUtilityService);
    getSessions(requestBody: any, response: any): Promise<any>;
    createSessions(requestBody: any, response: any): Promise<any>;
    uploadSessionToCloud(response: any, params: any, sessionRawFiles: any, requestBody: any): Promise<any>;
    getSessionsStatus(response: any, params: any): Promise<any>;
}
