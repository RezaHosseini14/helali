import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';
import { CurrentUser } from '@/shared/decorators/auth.decorators';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CheckAbility({ action: 'read', subject: 'User' })
  async findAll(@Query() query: ListUsersDto) {
    const data = await this.usersService.findAll(query.page, query.limit);

    return {
      message: 'لیست کاربران دریافت شد',
      data,
    };
  }

  @Get('profile')
  getProfile(@CurrentUser() user: IAuthenticatedUser) {
    return {
      message: 'پروفایل دریافت شد',
      data: this.usersService.getProfile(user),
    };
  }

  @Get('roles')
  @CheckAbility({ action: 'manage', subject: 'User' })
  async listRoles(@CurrentUser() user: IAuthenticatedUser) {
    const data = await this.usersService.listRolesForAssignment(user);

    return {
      message: 'لیست نقش‌ها دریافت شد',
      data,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckAbility({ action: 'manage', subject: 'User' })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: IAuthenticatedUser,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip ?? 'unknown';
    const data = await this.usersService.create(dto, user, ipAddress);

    return {
      message: 'کاربر با موفقیت ثبت نام شد',
      data,
    };
  }

  @Get('all-data-count')
  @CheckAbility({ action: 'read', subject: 'Dashboard' })
  async getAllDataCount() {
    const data = await this.usersService.getAllDataCount();

    return {
      message: 'آمار کلی دریافت شد',
      data,
    };
  }

  @Get(':id')
  @CheckAbility({ action: 'read', subject: 'User' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.findById(id);

    return {
      message: 'کاربر دریافت شد',
      data,
    };
  }

  @Patch(':id')
  @CheckAbility({ action: 'update', subject: 'User', field: 'id', param: 'id' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: IAuthenticatedUser,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip ?? 'unknown';
    const data = await this.usersService.update(id, dto, user, ipAddress);

    return {
      message: 'به روزرسانی با موفقیت انجام شد',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'manage', subject: 'User' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IAuthenticatedUser,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip ?? 'unknown';
    const data = await this.usersService.remove(id, user, ipAddress);

    return {
      message: data.message,
      data: null,
    };
  }
}
