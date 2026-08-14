import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
export declare class ResponseMappingInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): any;
    private isApiResponse;
    private isWrappedResponse;
}
