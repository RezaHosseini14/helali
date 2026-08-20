import { IsBoolean } from 'class-validator';

export class UpdateTweetPublishedDto {
  @IsBoolean()
  isPublished!: boolean;
}
