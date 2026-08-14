import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { IAuthenticatedUser } from '@/shared/types/auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): IAuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<{ user: IAuthenticatedUser }>();
    return request.user;
  },
);
