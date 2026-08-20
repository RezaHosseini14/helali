import { IsEmail, IsInt, IsOptional, IsString, MinLength } from 'class-validator';

import { MIN_PASSWORD_LENGTH } from '@helali/shared';

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
  @IsInt()
  age?: number;

  @IsOptional()
  @IsEmail({}, { message: 'ایمیل وارد شده معتبر نیست.' })
  email?: string;

  @IsOptional()
  @IsInt()
  roleId?: number;
}
