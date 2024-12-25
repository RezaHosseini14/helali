import { IsEnum } from 'class-validator';

export class UpdateStatusDto {
  @IsEnum(['pending', 'published', 'rejected'])
  newStatus: 'pending' | 'published' | 'rejected';
}
