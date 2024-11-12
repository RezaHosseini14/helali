import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { regsterAuthDto } from './dto/register-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import {
  comparePassword,
  hashString,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from 'src/common/utils/functions';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { loginAuthDto } from './dto/login-auth.dto';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(regsterAuthDto: regsterAuthDto) {
    const {
      confirmPassword,
      first_name,
      last_name,
      password,
      roles,
      username,
    } = regsterAuthDto;

    await this.findOneByUsername(username);

    const hashedPassword = await hashString(password);

    await this.userModel.create({
      first_name,
      last_name,
      username,
      password: hashedPassword,
      roles,
    });

    return new HttpException('کاربر با موفقیت ثبت نام شد', HttpStatus.ACCEPTED);
  }

  async login(loginAuthDto: loginAuthDto, res: Response) {
    try {
      const { username, password } = loginAuthDto;

      const user = await this.userModel.findOne({ username });
      if (!user)
        throw new UnauthorizedException({
          message: 'رمز عبور یا نام کاربری صحیح نمی باشد',
          status: HttpStatus.UNAUTHORIZED,
        });

      if (user.status) {
        throw new UnauthorizedException({
          message: 'شما مسدود شده اید',
          status: HttpStatus.UNAUTHORIZED,
        });
      }

      const comparePasswordResult = await comparePassword(
        password,
        user.password,
      );

      if (!comparePasswordResult) {
        throw new UnauthorizedException({
          message: 'رمز عبور یا نام کاربری صحیح نمی باشد',
          status: HttpStatus.UNAUTHORIZED,
        });
      }
      const { roles, status } = user;
      const userId = user._id;

      const refreshToken = this.jwtService.sign({
        id: userId,
      });

      await this.userModel.findByIdAndUpdate(user._id, {
        refresh_token: refreshToken,
      });

      const accessToken = this.jwtService.sign({
        userId,
        username,
        status,
        roles,
      });

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

  async findOneByUsername(username: string) {
    try {
      const existUser = await this.userModel.findOne({ username });
      if (existUser)
        throw new HttpException(
          'کاربر قبلا ثبت نام کرده',
          HttpStatus.NOT_FOUND,
        );
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
        throw new HttpException(
          'لطفا دوباره وارد شوید',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const verifyOptions: JwtVerifyOptions = {
        secret: 'secret',
      };

      const decoded = await this.jwtService.verify(token, verifyOptions);

      const user = await this.userModel.findOne(
        { _id: decoded.userId },
        { password: 0, accessToken: 0 },
      );

      res.status(HttpStatus.OK).json({ token, user });
    } catch (error) {
      res.status(error.getStatus()).json({ message: error.message });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        // throw new HttpException('مشکلی پیش آمده است', HttpStatus.UNAUTHORIZED);
        res.status(401).json({
          status: 401,
          message: 'مشکلی پیش آمده است',
        });
      }

      const user = await this.userModel.findOne(
        { refresh_token: refreshToken },
        { password: 0 },
      );

      if (!user) {
        // throw new HttpException('توکن معتبر نیست', HttpStatus.UNAUTHORIZED);
        res.status(401).json({
          status: 401,
          message: 'توکن معتبر نیست',
        });
      }

      const verifyOptions: JwtVerifyOptions = {
        secret: 'secret',
        // secret: process.env.REFRESH_TOKEN_SECRET_KEY,
      };

      const decoded = await this.jwtService.verify(refreshToken, verifyOptions);

      const accessToken = this.jwtService.sign({ user }, { expiresIn: '1d' });
      const newRefreshToken = this.jwtService.sign({
        id: user._id,
      });

      setAccessTokenCookie(res, accessToken);
      setRefreshTokenCookie(res, newRefreshToken);

      res.status(200).json({
        status: 200,
        message: 'وارد هستید',
      });
    } catch (error) {
      throw error;
    }
  }
}
