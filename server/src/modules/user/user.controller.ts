import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/enums/role.enums';
import { AuthGuard } from 'src/common/guard/auth.guard';
// import { Request } from 'express';
import { Pagination } from 'src/common/decorator/pagination.decorator';
import { Request } from 'express';

@Controller('user')
@ApiTags('User')
// @ApiBearerAuth()
// @Roles(Role.ADMIN)
// @UseGuards(AuthGuard, RoleGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of users' })
  @ApiResponse({
    status: 200,
    description: 'Paginated user list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
            },
          },
        },
        total: { type: 'number', example: 100 },
        currentPage: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  async findAll(@Pagination() pagination: { limit: number; page: number }) {
    const { limit, page } = pagination;
    return await this.userService.findAll(limit, page);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  // @Patch('/block/:id')
  // @Roles(Role.SUPER)
  // @UseGuards(AuthGuard, RoleGuard)
  // blockUser(@Param('id') id: string, @Req() request: Request) {
  //   return this.userService.blockUser(id, request);
  // }

  @Patch(':id')
  @Roles(Role.SUPER)
  @UseGuards(AuthGuard, RoleGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: number, @Req() request: Request) {
    return await this.userService.remove(id, request);
  }
}
