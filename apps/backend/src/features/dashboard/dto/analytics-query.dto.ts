import { IsDateString, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['audio', 'video', 'gallery', 'all'])
  entityType?: 'audio' | 'video' | 'gallery' | 'all' = 'all';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

export class AnalyticsTopQueryDto extends AnalyticsQueryDto {
  @IsOptional()
  @IsIn(['views', 'likes'])
  metric?: 'views' | 'likes' = 'views';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class AnalyticsCategoryQueryDto {
  @IsIn(['audio', 'video'])
  entityType!: 'audio' | 'video';

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
