import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAudioDto {
  @IsNotEmpty()
  @IsString()
  title: string;
}
