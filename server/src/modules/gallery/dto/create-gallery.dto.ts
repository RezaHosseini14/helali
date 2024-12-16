import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGalleryDto {
  @ApiProperty({
    description: 'توضیحات تصویر',
    type: String,
    required: false,
    example: 'این یک تصویر تستی است',
  })
  @IsOptional()
  @IsString()
  desc: string;
}
