import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { regsterAuthDto } from './dto/register-auth.dto';
import { comparePassword, hashString, setAccessTokenCookie, setRefreshTokenCookie } from 'src/common/utils/functions';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { loginAuthDto } from './dto/login-auth.dto';
import { Response, Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
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

      const refreshToken = this.jwtService.sign({
        id: userId,
      });

      await this.userRepository.update(userId, {
        refresh_token: refreshToken,
      });

      const accessToken = this.jwtService.sign({
        userId,
        username,
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
        secret: 'secret',
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

      // const user = await this.userModel.findOne(
      //   { refresh_token: refreshToken },
      //   { password: 0 },
      // );

      // if (!user) {
      //   res.status(401).json({
      //     status: 401,
      //     message: 'توکن معتبر نیست',
      //   });
      // }

      // const verifyOptions: JwtVerifyOptions = {
      //   secret: 'secret',
      // };

      // const decoded = await this.jwtService.verify(refreshToken, verifyOptions);

      // const accessToken = this.jwtService.sign({ user }, { expiresIn: '1d' });
      // const newRefreshToken = this.jwtService.sign({
      //   id: user._id,
      // });

      // setAccessTokenCookie(res, accessToken);
      // setRefreshTokenCookie(res, newRefreshToken);

      // res.status(200).json({
      //   status: 200,
      //   message: 'وارد هستید',
      // });
    } catch (error) {
      throw error;
    }
  }
}
