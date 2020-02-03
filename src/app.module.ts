import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

// connecting data base
import {MongooseModule} from '@nestjs/mongoose';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forRoot('mongodb://localhost/digital_green', {useNewUrlParser: true, useUnifiedTopology: true, reconnectTries: 2}),
    UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
