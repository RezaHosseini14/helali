import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/role.decorator';
import { Role } from 'src/common/enums/role.enums';
import { Pagination } from 'src/common/decorator/pagination.decorator';
import { Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/all-data-count')
  @UseGuards(AuthGuard)
  async allDataCount() {
    return await this.userService.allDataCount();
  }

  @Get('/profile')
  @UseGuards(AuthGuard)
  async profile(@Req() request: Request) {
    return request?.user;
  }

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
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

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
