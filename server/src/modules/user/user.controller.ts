import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/enums/role.enums';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { Request } from 'express';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@UseGuards(AuthGuard, RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  findAll(@Query() query) {
    const { page, limit } = query;
    return this.userService.findAll(page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('/block/:id')
  @Roles(Role.SUPER)
  @UseGuards(AuthGuard, RoleGuard)
  blockUser(@Param('id') id: string, @Req() request: Request) {
    return this.userService.blockUser(id, request);
  }

  @Patch(':id')
  @Roles(Role.SUPER)
  @UseGuards(AuthGuard, RoleGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER)
  @UseGuards(AuthGuard, RoleGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
