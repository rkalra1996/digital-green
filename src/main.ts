// tslint:disable-next-line: no-var-requires
const config = require('dotenv').config();
import {env as ENV} from 'process';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });
  // enable cors
  app.enableCors();
  await app.listen(ENV.SERVER_PORT);
  console.log('server up and running at port -> ', ENV.SERVER_PORT);
}
bootstrap();
