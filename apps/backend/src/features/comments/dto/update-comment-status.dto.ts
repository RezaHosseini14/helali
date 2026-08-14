import { IsEnum, IsNotEmpty } from 'class-validator';

import { COMMENT_STATUS_VALUES } from '@helali/shared';

export class UpdateCommentStatusDto {
  @IsNotEmpty()
  @IsEnum(COMMENT_STATUS_VALUES)
  newStatus!: (typeof COMMENT_STATUS_VALUES)[number];
}
