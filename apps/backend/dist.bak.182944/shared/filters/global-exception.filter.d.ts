import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
    private mapPrismaError;
    private isTransientDatabaseError;
    private extractMessage;
    private extractData;
}
