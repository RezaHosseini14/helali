import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const query = request.query;

  const page = query.page ? parseInt(query.page, 10) : undefined;
  const limit = query.limit ? parseInt(query.limit, 10) : undefined;

  return {
    page: page ? Math.max(page, 1) : undefined,
    limit: limit ? Math.min(Math.max(limit, 1), 100) : undefined,
  };
});
