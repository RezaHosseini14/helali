import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

import { MIN_PASSWORD_LENGTH, ROLE_NAME_VALUES } from '@helali/shared';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsEmail({}, { message: 'ایمیل وارد شده معتبر نیست.' })
  email?: string;

  @IsOptional()
  @IsEnum(ROLE_NAME_VALUES)
  role?: UserRole;
}
