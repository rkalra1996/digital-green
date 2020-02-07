import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug'],
  });
  // enable cors
  app.enableCors();
  await app.listen(3000);
  console.log('server up and running at port -> ', 3000);
}
bootstrap();
