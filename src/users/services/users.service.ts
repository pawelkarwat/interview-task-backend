import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { RegistrationReqModel } from '../models/registration.req.model';
import { RegistrationRespModel } from '../models/registration.resp.model';
import { User } from '../entities/user';
import * as bcrypt from 'bcrypt';
import * as randomToken from 'rand-token';
import { CurrentUser } from '../models/current.user';
import * as moment from 'moment';
import { Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { S3Service } from './s3.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service,
  ) {}

  public async registerUser(
    registrationData: RegisterDto,
  ): Promise<RegistrationRespModel> {
    const errorMessage = await this.registrationValidation(registrationData);
    if (errorMessage) {
      return {
        message: errorMessage,
        success: false,
      };
    }

    const fileLocation = await this.s3Service.uploadFile(
      registrationData.avatar,
    );

    if (!fileLocation) {
      return {
        message: 'Nie udało się wgrać zdjęcia do S3',
        success: false,
      };
    }

    const newUser = new User();
    newUser.login = registrationData.login;
    newUser.password = await this.getPasswordHash(registrationData.password);
    newUser.avatarImageUrl = fileLocation;

    await this.user.insert(newUser);

    await this.s3Service.uploadFile(registrationData.avatar);

    return {
      message: 'Registered succesfully',
      success: true,
    };
  }

  public async validateUserCredentials(
    login: string,
    password: string,
  ): Promise<CurrentUser> {
    const user = await this.user.findOne({
      where: [{ login: login }],
    });

    if (user == null) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    return {
      userId: user.userId,
      login: user.login,
    };
  }

  public async getJwtToken(user: CurrentUser): Promise<string> {
    const payload = {
      ...user,
    };
    return this.jwtService.signAsync(payload);
  }

  public async getRefreshToken(userId: string): Promise<string> {
    const userDataToUpdate = {
      refreshToken: randomToken.generate(16),
      refreshTokenExp: moment().add(1, 'w').format('YYYY/MM/DD'),
    };

    await this.user.update(userId, userDataToUpdate);
    return userDataToUpdate.refreshToken;
  }

  public async validRefreshToken(
    login: string,
    refreshToken: string,
  ): Promise<CurrentUser> {
    const currentDate = moment().format('YYYY/MM/DD');
    const user = await this.user.findOne({
      where: {
        login,
        refreshToken,
        refreshTokenExp: MoreThanOrEqual(currentDate),
      },
    });

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      login: user.login,
    };
  }

  private async registrationValidation(
    registration: RegisterDto,
  ): Promise<string> {
    if (!registration.login) {
      return "Login can't be empty";
    }

    if (!registration.password) {
      return "Password can't be empty";
    }

    const user = await this.user.findOne({
      where: [{ login: registration.login }],
    });
    if (user != null && user.login) {
      return 'Login already exists';
    }
  }

  private async getPasswordHash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
