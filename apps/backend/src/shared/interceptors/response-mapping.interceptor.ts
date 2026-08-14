import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';

import type { IApiResponse } from '@helali/shared';

interface IResponseData<TData> {
  readonly message?: string;
  readonly data: TData;
  readonly meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseMappingInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler) {
    return (next.handle() as any).pipe(
      map((result: unknown) => {
        if (this.isApiResponse(result)) {
          return result;
        }

        if (this.isWrappedResponse(result)) {
          return {
            success: true as const,
            message: result.message ?? 'Operation successful',
            data: result.data,
            meta: result.meta,
          };
        }

        return {
          success: true as const,
          message: 'Operation successful',
          data: result,
        };
      }),
    );
  }

  private isApiResponse(value: unknown): value is IApiResponse<unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      'success' in value &&
      (value as IApiResponse<unknown>).success === true
    );
  }

  private isWrappedResponse(value: unknown): value is IResponseData<unknown> {
    return typeof value === 'object' && value !== null && 'data' in value;
  }
}
