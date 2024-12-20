import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Pagination = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const query = request.query;

  const page = parseInt(query.page, 10) || 1; // صفحه پیش‌فرض: 1
  const limit = parseInt(query.limit, 10) || 10; // تعداد موارد پیش‌فرض: 10

  return {
    page: Math.max(page, 1), // اطمینان از معتبر بودن شماره صفحه
    limit: Math.min(Math.max(limit, 1), 100), // محدود کردن تعداد موارد به حداکثر 100
  };
});
