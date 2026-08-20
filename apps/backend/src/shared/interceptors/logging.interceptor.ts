import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: { id: number };
    }>();
    const start = Date.now();

    return (next.handle() as any).pipe(
      tap(() => {
        const duration = Date.now() - start;
        const userId = request.user?.id ?? 'anonymous';
        console.log(
          `[${request.method}] ${request.url} - ${duration}ms - user:${userId}`,
        );
      }),
      catchError((error: unknown) => {
        const duration = Date.now() - start;
        const userId = request.user?.id ?? 'anonymous';
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `[${request.method}] ${request.url} - ${duration}ms - user:${userId} - FAILED: ${message}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
