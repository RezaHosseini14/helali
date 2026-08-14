import { ArrayMinSize, IsArray, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

import { parseCategoryIdsTransform } from '@/shared/dto/parse-category-ids';
import { parseOptionalIntTransform } from '@/shared/dto/parse-optional-int';

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @Transform(parseCategoryIdsTransform)
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  categories?: number[];

  @IsOptional()
  @Transform(parseOptionalIntTransform)
  @IsInt()
  relatedAudioId?: number | null;
}
