import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CurrentUser } from '../models/current.user';
import { UsersService } from '../services/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly usersService: UsersService) {
    super({ usernameField: 'login' });
  }

  async validate(login: string, password: string): Promise<CurrentUser> {
    console.log('halo');

    const user = await this.usersService.validateUserCredentials(
      login,
      password,
    );

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
