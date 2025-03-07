import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { regsterAuthDto } from './dto/register-auth.dto';
import { comparePassword, hashString, setAccessTokenCookie, setRefreshTokenCookie } from 'src/common/utils/functions';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { loginAuthDto } from './dto/login-auth.dto';
import { Response, Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async findOneByUsername(phone_number: string) {
    try {
      const existUser = await this.userRepository.findOne({
        where: { phone_number },
      });
      if (existUser) throw new HttpException('کاربر قبلا ثبت نام کرده', HttpStatus.NOT_FOUND);
    } catch (error) {
      throw error;
    }
  }

  async register(regsterAuthDto: regsterAuthDto) {
    const { confirmPassword, phone_number, password, first_name, last_name, username, email, age } = regsterAuthDto;

    await this.findOneByUsername(phone_number);

    if (password !== confirmPassword) {
      throw new HttpException('پسورد و تاییدیه پسورد باید یکسان باشند.', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await hashString(password);

    const user = this.userRepository.create({
      phone_number,
      first_name,
      last_name,
      username,
      email,
      age,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);

    if (savedUser) {
      return new HttpException('کاربر با موفقیت ثبت نام شد', HttpStatus.ACCEPTED);
    }
  }

  async login(loginAuthDto: loginAuthDto, res: Response) {
    try {
      const { username, password } = loginAuthDto;

      const user = await this.userRepository.findOne({ where: { username } });

      if (!user)
        throw new UnauthorizedException({
          message: 'رمز عبور یا نام کاربری صحیح نمی باشد',
          status: HttpStatus.UNAUTHORIZED,
        });

      const comparePasswordResult = await comparePassword(password, user.password);

      if (!comparePasswordResult) {
        throw new UnauthorizedException({
          message: 'رمز عبور یا نام کاربری صحیح نمی باشد',
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      const userId = user.id;

      const refreshToken = this.jwtService.sign(
        {
          id: userId,
        },
        { secret: this.configService.get('Jwt.refreshTokenSecret'), expiresIn: '1y' },
      );

      await this.userRepository.update(userId, {
        refresh_token: refreshToken,
      });

      const accessToken = this.jwtService.sign(
        {
          userId,
          username,
        },
        { secret: this.configService.get('Jwt.accessTokenSecret'), expiresIn: '30d' },
      );

      await setRefreshTokenCookie(res, refreshToken);

      await setAccessTokenCookie(res, accessToken);

      res.status(200).json({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (error) {
      throw error;
    }
  }

  async logout(res: Response) {
    try {
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');

      return res.status(HttpStatus.OK).json({
        message: 'با موفقیت خارج شدید',
        status: HttpStatus.OK,
      });
    } catch (error) {
      throw error;
    }
  }

  async verifyLogin(req: Request, res: Response) {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        throw new HttpException('لطفا دوباره وارد شوید', HttpStatus.UNAUTHORIZED);
      }

      const verifyOptions: JwtVerifyOptions = {
        secret: process.env.ACCESS_TOKEN_SECRET,
      };

      const decoded = await this.jwtService.verify(token, verifyOptions);

      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          first_name: true,
          last_name: true,
          phone_number: true,
          age: true,
          email: true,
          created_at: true,
        },
      });

      res.status(HttpStatus.OK).json({ user });
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          status: 401,
          message: 'توکن یافت نشد',
        });
      }

      const user = await this.userRepository.findOne({ where: { refresh_token: refreshToken } });
      if (!user) {
        return res.status(401).json({
          status: 401,
          message: 'توکن معتبر نیست',
        });
      }

      let decoded;
      try {
        decoded = await this.jwtService.verify(refreshToken, {
          secret: this.configService.get('Jwt.refreshTokenSecret'),
        });
      } catch (err) {
        return res.status(403).json({
          status: 403,
          message: 'توکن منقضی شده است',
        });
      }

      if (decoded.id !== user.id) {
        return res.status(403).json({
          status: 403,
          message: 'توکن معتبر نیست',
        });
      }

      return res.status(200).json({
        status: 200,
        message: 'توکن جدید صادر شد',
        accessToken: req.cookies.accessToken,
      });
    } catch (error) {
      console.error('Error in refreshToken:', error);
      return res.status(500).json({
        status: 500,
        message: 'خطای سرور',
      });
    }
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<any>(token, {
        secret: this.configService.get('Jwt.accessTokenSecret'),
      });

      if (typeof payload === 'object' && payload?.userId) {
        const user = await this.userRepository.findOne({
          where: { id: payload.userId },
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            phone_number: true,
            age: true,
            email: true,
            created_at: true,
          },
        });

        if (!user) {
          throw new UnauthorizedException('به حساب کاربری خود وارد شوید');
        }

        return user;
      }

      throw new UnauthorizedException('به حساب کاربری خود وارد شوید');
    } catch (error) {
      throw new UnauthorizedException('به حساب کاربری خود وارد شوید');
    }
  }
}
