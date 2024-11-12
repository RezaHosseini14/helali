import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/schemas/User.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { checkYourself } from 'src/common/utils/functions';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = new this.userModel(createUserDto);
    return await newUser.save();
  }

  async findAll(page, limit) {
    try {
      const pageDefault: number = page || 1;
      const limitDefault: number = limit || 10;

      const totalUsers: number = await this.userModel.countDocuments();
      const skip: number = (pageDefault - 1) * limitDefault;

      const users: any[] = await this.userModel.find().skip(skip).limit(limit);

      if (!users) {
        throw new HttpException('کاربری یافت نشد', HttpStatus.NOT_FOUND);
      }

      return {
        users,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        total: totalUsers,
      };
    } catch (error) {}
  }

  async findOne(id: string) {
    try {
      const user = await this.userModel.findOne({ _id: id });
      if (!user) {
        throw new HttpException(
          'کاربر مورد نظر یافت نشد',
          HttpStatus.NOT_FOUND,
        );
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.findOne(id);
      const userUpdate = await this.userModel.updateOne(
        { _id: id },
        { $set: updateUserDto },
      );
      if (userUpdate.modifiedCount == 0)
        throw new HttpException(
          'به روزرسانی انجام نشد',
          HttpStatus.BAD_REQUEST,
        );

      return new HttpException('به روزرسانی با موفقیت انجام شد', HttpStatus.OK);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      const deleteUser = await this.userModel.deleteOne({ _id: id });
      if (deleteUser.deletedCount == 0)
        throw new HttpException('کاربر حذف نشد', HttpStatus.BAD_REQUEST);

      return new HttpException('کاربر مورد نظر حذف شد', HttpStatus.ACCEPTED);
    } catch (error) {
      throw error;
    }
  }

  async blockUser(id: string, req: Request) {
    try {
      checkYourself(req, id, 'امکان مسدود کردن کاربر نیست');

      const user = await this.findOne(id);

      const newStatus = !user.status;
      await this.userModel.findByIdAndUpdate(id, {
        status: newStatus,
      });

      if (user.status) {
        return new HttpException(
          'کاربر از مسدود بودن خارج شد',
          HttpStatus.ACCEPTED,
        );
      } else {
        return new HttpException(
          'کاربر با موفقیت مسدود شد',
          HttpStatus.ACCEPTED,
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
