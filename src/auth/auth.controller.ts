import { Controller, Headers, Get, UseGuards, Inject, Post, Param, Patch, Body, NotFoundException, HttpException, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from 'src/guard/auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    @Inject('EMAIL_SERVICE') private readonly emailService: ClientProxy,
    private _configService: ConfigService
  ) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {

    const user = await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'register-user' }, createUserDto));

    // Una volta registrato invio una mail di conferma
    this.emailService.emit('send-mail', {
        to: user.email,
        name: user.fullName,
        subject: 'Conferma registrazione',
      });

    return user;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'login-user' }, loginDto));
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  async getUser(@Param('id') id: string) {
    return await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'get-user' }, id));
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Headers('Authorization') token: string) {
    console.log('token', token);
    return await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'get-me' }, { token: token?.replace('Bearer ', '') }));
  }

  @Patch('user/:id')
  @UseGuards(AuthGuard)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await firstValueFrom(this.authService.send({ service: this._configService.get('AUTH_SERVICE_NAME'), cmd: 'update-user' }, { id, ...updateUserDto }));
  }
}
