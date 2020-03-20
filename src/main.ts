// tslint:disable-next-line: no-var-requires
import {env as ENV} from 'process';

console.log('loading environment config from ', ENV['DG_ENV_CONFIG_PATH']);
const config = require('dotenv').config({ path: ENV['DG_ENV_CONFIG_PATH'] , debug: true});

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });
  // enable cors
  app.enableCors();
  if (config.error) {
    console.log('error while loading the environment variables', config);
  } else {
    console.log('config loaded is ', config);
    await app.listen(ENV.DG_STAGING_SERVER_PORT);
    console.log('server up and running at port -> ', ENV.DG_STAGING_SERVER_PORT);
  }
}
bootstrap();
