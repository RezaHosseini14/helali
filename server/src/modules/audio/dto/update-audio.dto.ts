import { PartialType } from '@nestjs/mapped-types';
import { CreateAudioDto } from './create-audio.dto';
import { IsArray, IsNotEmpty, IsOptional, IsString, ArrayMinSize, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateAudioDto extends PartialType(CreateAudioDto) {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  text: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((item) => parseInt(item, 10));
    }
    return value;
  })
  categories: number[];
}
