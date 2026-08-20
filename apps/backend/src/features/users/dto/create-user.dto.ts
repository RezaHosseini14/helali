import { IsInt, IsOptional } from 'class-validator';

import { RegisterDto } from '@/features/auth/dto/register.dto';

export class CreateUserDto extends RegisterDto {
  @IsOptional()
  @IsInt({ message: 'نقش باید یک عدد باشد.' })
  roleId?: number;
}
