import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: 'نام کاربری نمی‌تواند خالی باشد.' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد.' })
  @IsString()
  password: string;

  @IsNotEmpty({ message: 'تکرار رمز عبور نمی‌تواند خالی باشد.' })
  @IsString()
  confirmPassword: string;

  @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد.' })
  @IsString()
  first_name: string;

  @IsNotEmpty({ message: 'نام خانوادگی نمی‌تواند خالی باشد.' })
  @IsString()
  last_name: string;

  @IsNotEmpty({ message: 'نقش‌ها نمی‌توانند خالی باشند.' })
  @IsArray({ message: 'نقش‌ها باید یک آرایه باشد.' })
  roles: string[];
}
