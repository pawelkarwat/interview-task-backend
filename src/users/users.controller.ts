import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { FormDataRequest } from 'nestjs-form-data';
import { RegisterDto } from './dto/register.dto';
import { CurrentUser } from './models/current.user';
import { UsersService } from './services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post('register')
  @FormDataRequest()
  async registerUser(@Body() reqBody: RegisterDto, @Res() res: Response) {
    console.log(reqBody);
    const response = await this.userService.registerUser(reqBody);
    if (response.success) {
      return res.status(200).send(response);
    }
    return res.status(400).send(response);
  }

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.userService.getJwtToken(req.user as CurrentUser);
    const refreshToken = await this.userService.getRefreshToken(
      req.user.userId,
    );
    res.cookie('auth-cookie', { token, refreshToken }, { httpOnly: true });
    res.status(200).send({ message: 'success' });
  }

  @Get('refresh-tokens')
  @UseGuards(AuthGuard('refresh'))
  async generateTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const token = await this.userService.getJwtToken(req.user as CurrentUser);
    const refreshToken = await this.userService.getRefreshToken(
      req.user.userId,
    );
    res.cookie('auth-cookie', { token, refreshToken }, { httpOnly: true });
    res.status(200).send({ message: 'success' });
  }
}
