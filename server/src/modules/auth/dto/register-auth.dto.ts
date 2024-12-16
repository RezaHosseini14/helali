import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class regsterAuthDto {
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

  @IsNotEmpty({ message: 'تلفن همراه نمی‌تواند خالی باشد.' })
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsNumber({}, { message: 'سن باید یک عدد باشد.' })
  age: number;

  @IsOptional()
  @IsEmail({}, { message: 'ایمیل وارد شده معتبر نیست.' })
  email: string;

  // @IsNotEmpty({ message: 'نقش‌ها نمی‌توانند خالی باشند.' })
  // @IsArray({ message: 'نقش‌ها باید یک آرایه باشد.' })
  // roles: string[];
}
