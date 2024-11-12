import { IsNotEmpty, IsString } from 'class-validator';

export class loginAuthDto {
  @IsNotEmpty({ message: 'نام کاربری نمی‌تواند خالی باشد.' })
  @IsString()
  username: string;

  @IsNotEmpty({ message: ' رمزهبور نمی‌تواند خالی باشد.' })
  @IsString()
  password: string;
}
