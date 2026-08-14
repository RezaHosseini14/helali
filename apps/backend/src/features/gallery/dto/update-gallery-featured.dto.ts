import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

import { parseRequiredMultipartBoolean } from '@/shared/dto/parse-multipart-boolean';

export class UpdateGalleryFeaturedDto {
  @Transform(parseRequiredMultipartBoolean)
  @IsBoolean()
  isFeatured!: boolean;
}
