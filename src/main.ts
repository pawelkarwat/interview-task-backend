import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as multer from 'multer';
import * as express from 'express';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.use(bodyParser.json());
  // app.use(bodyParser.urlencoded({ extended: true }));
  // app.use(multer().array());
  // app.use(express.static('public'));
  await app.listen(3000);
}
bootstrap();
