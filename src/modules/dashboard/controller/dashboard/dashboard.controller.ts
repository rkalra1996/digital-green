import { Controller, Get, Res } from '@nestjs/common';

@Controller('dashboard')
export class DashboardController {

    constructor() {}

    @Get('get-report')
    async getDatabaseReport(@Res() response): Promise<any> {
        console.log('dashboard hi');
        response.status(200).send({ok: true});
    }
}
