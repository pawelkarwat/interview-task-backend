import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { User } from './entities/user';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import * as Joi from 'joi';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { S3Service } from './services/s3.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SECRET_KEY: Joi.string().required(),
        AWS_S3_BUCKET: Joi.string().required(),
        AWSAccessKeyId: Joi.string().required(),
        AWSSecretKey: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.SECRET_KEY,
      signOptions: {
        expiresIn: 60,
      },
    }),
    PassportModule,
    NestjsFormDataModule,
  ],
  providers: [
    UsersService,
    LocalStrategy,
    JwtStrategy,
    RefreshStrategy,
    S3Service,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
