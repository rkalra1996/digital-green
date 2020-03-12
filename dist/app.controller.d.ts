import { AppService } from './app.service';
import { Logger } from 'winston';
export declare class AppController {
    private readonly logger;
    private readonly appService;
    constructor(logger: Logger, appService: AppService);
    getHello(): string;
}
