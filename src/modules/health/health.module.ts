import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import { TerminusModule, MongooseHealthIndicator, TerminusModuleOptions} from '@nestjs/terminus';

import {env as ENV} from 'process';

const getTerminusOptions = (
    mongoose: MongooseHealthIndicator,
  ): TerminusModuleOptions => ({
    endpoints: [
      {
        url: '/health',
        healthIndicators: [async () => await mongoose.pingCheck('mongo')],
      },
    ],
  });

@Module({
    imports: [
        MongooseModule.forRoot(ENV.DG_STAGING_DB_HOST, {useNewUrlParser: true, useUnifiedTopology: true}),
        TerminusModule.forRootAsync({
          inject: [MongooseHealthIndicator],
          useFactory: getTerminusOptions,
        }),
      ],
})
export class HealthModule {}
