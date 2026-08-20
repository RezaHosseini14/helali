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
} from '@nestjs/common';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';
import { CurrentUser } from '@/shared/decorators/auth.decorators';
import type { IAuthenticatedUser } from '@/shared/types/auth.types';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('permissions/catalog')
  @CheckAbility({ action: 'manageRoles', subject: 'User' })
  async listPermissions() {
    const data = await this.rolesService.listPermissions();

    return {
      message: 'کاتالوگ دسترسی‌ها دریافت شد',
      data,
    };
  }

  @Get()
  @CheckAbility({ action: 'manageRoles', subject: 'User' })
  async findAll() {
    const data = await this.rolesService.findAll();

    return {
      message: 'لیست نقش‌ها دریافت شد',
      data,
    };
  }

  @Get(':id')
  @CheckAbility({ action: 'manageRoles', subject: 'User' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.rolesService.findById(id);

    return {
      message: 'نقش دریافت شد',
      data,
    };
  }

  @Post()
  @CheckAbility({ action: 'manageRoles', subject: 'User' })
  async create(
    @Body() body: CreateRoleDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const data = await this.rolesService.create(body, user);

    return {
      message: 'نقش ایجاد شد',
      data,
    };
  }

  @Patch(':id')
  @CheckAbility({ action: 'manageRoles', subject: 'User' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateRoleDto,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const data = await this.rolesService.update(id, body, user);

    return {
      message: 'نقش به‌روزرسانی شد',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'manageRoles', subject: 'User' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: IAuthenticatedUser,
  ) {
    const data = await this.rolesService.remove(id, user);

    return {
      message: 'نقش حذف شد',
      data,
    };
  }
}
