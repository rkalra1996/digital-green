import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';

import {Logger} from 'winston';

@Controller()
export class AppController {
  constructor(
    @Inject('winston') private readonly logger: Logger,
    private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
