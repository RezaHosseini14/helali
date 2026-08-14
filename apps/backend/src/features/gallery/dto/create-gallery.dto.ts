import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

import { parseMultipartBoolean } from '@/shared/dto/parse-multipart-boolean';

export class CreateGalleryDto {
  @IsOptional()
  @IsString()
  desc?: string;

  @IsOptional()
  @Transform(parseMultipartBoolean)
  @IsBoolean()
  isFeatured?: boolean;
}
