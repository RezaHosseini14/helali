import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/common/enums/role.enums';

export class RegisterFullAuthDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  last_name: string;

  @IsNotEmpty()
  roles: Role;
}
