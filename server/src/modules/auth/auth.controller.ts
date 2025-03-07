import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { regsterAuthDto } from './dto/register-auth.dto';
import { Request, Response } from 'express';
import { loginAuthDto } from './dto/login-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  register(@Body() regsterAuthDto: regsterAuthDto) {
    return this.authService.register(regsterAuthDto);
  }

  @Post('/login')
  login(@Body() loginAuthDto: loginAuthDto, @Res() res: Response) {
    return this.authService.login(loginAuthDto, res);
  }

  @Get('/logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }

  @Get('/verifylogin')
  verifyLogin(@Req() req: Request, @Res() res: Response) {
    return this.authService.verifyLogin(req, res);
  }

  @Get('/refreshtoken')
  refreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.refreshToken(req, res);
  }
}
