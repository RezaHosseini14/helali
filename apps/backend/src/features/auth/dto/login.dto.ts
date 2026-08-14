import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'نام کاربری نمی‌تواند خالی باشد.' })
  @IsString()
  username!: string;

  @IsNotEmpty({ message: 'رمز عبور نمی‌تواند خالی باشد.' })
  @IsString()
  password!: string;
}
