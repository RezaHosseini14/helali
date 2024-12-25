import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { checkYourself } from 'src/common/utils/functions';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(limit: number, page: number) {
    try {
      const [users, total] = await this.userRepository
        .createQueryBuilder('user')
        .orderBy('user.id', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      if (users.length <= 0) {
        throw new HttpException('کاربری یافت نشد', HttpStatus.NOT_FOUND);
      }

      return {
        users,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error('خطا در دریافت کاربران:', error);
      throw new HttpException('مشکلی در دریافت کاربران رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    try {
      // const user = await this.userModel.findOne({ _id: id });
      // if (!user) {
      //   throw new HttpException(
      //     'کاربر مورد نظر یافت نشد',
      //     HttpStatus.NOT_FOUND,
      //   );
      // }
      // return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // await this.findOne(id);
      // const userUpdate = await this.userModel.updateOne(
      //   { _id: id },
      //   { $set: updateUserDto },
      // );
      // if (userUpdate.modifiedCount == 0)
      //   throw new HttpException(
      //     'به روزرسانی انجام نشد',
      //     HttpStatus.BAD_REQUEST,
      //   );

      return new HttpException('به روزرسانی با موفقیت انجام شد', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number, req: Request) {
    try {
      //@ts-ignore
      if (req.user.userId === id) {
        throw new HttpException('نمی تواندی خودتان را حذف کنید', HttpStatus.BAD_REQUEST);
      }

      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new HttpException('کاربر موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }
      await this.userRepository.delete(id);
      return {
        message: 'کاربر حذف شد',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }
}
