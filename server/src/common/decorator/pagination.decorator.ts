import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const query = request.query;

  const page = query.page ? Math.max(parseInt(query.page, 10), 1) : null;

  const limit = query.limit ? Math.min(Math.max(parseInt(query.limit, 10), 1), 100) : undefined;

  return {
    page,
    limit,
  };
});
