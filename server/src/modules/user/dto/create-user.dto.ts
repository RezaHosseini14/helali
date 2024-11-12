import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  //   first_nam;
  //   last_name;
  //   username;
  //   password;
  //   roles;
}
