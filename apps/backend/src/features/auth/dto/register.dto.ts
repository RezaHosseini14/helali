import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { MIN_PASSWORD_LENGTH } from '@helali/shared';

export class RegisterDto {
  @IsNotEmpty({ message: 'نام کاربری نمی‌تواند خالی باشد.' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد.' })
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH, { message: 'رمز عبور کوتاه است.' })
  password!: string;

  @IsNotEmpty({ message: 'تکرار رمز عبور نمی‌تواند خالی باشد.' })
  @IsString()
  confirmPassword!: string;

  @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد.' })
  @IsString()
  firstName!: string;

  @IsNotEmpty({ message: 'نام خانوادگی نمی‌تواند خالی باشد.' })
  @IsString()
  lastName!: string;

  @IsNotEmpty({ message: 'تلفن همراه نمی‌تواند خالی باشد.' })
  @IsString()
  phoneNumber!: string;

  @IsOptional()
  @IsNumber({}, { message: 'سن باید یک عدد باشد.' })
  age?: number;

  @IsOptional()
  @IsEmail({}, { message: 'ایمیل وارد شده معتبر نیست.' })
  email?: string;
}
