import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

import type { IApiErrorResponse } from '@helali/shared';

const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);

@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const errorBody: IApiErrorResponse = {
        success: false,
        message: this.extractMessage(exceptionResponse, exception.message),
        data: this.extractData(exceptionResponse),
      };

      response.status(status).json(errorBody);
      return;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const errorBody = this.mapPrismaError(exception);
      response.status(errorBody.status).json(errorBody.body);
      return;
    }

    if (this.isTransientDatabaseError(exception)) {
      console.error('Database unavailable:', exception);

      const errorBody: IApiErrorResponse = {
        success: false,
        message: 'Database temporarily unavailable. Please retry.',
        data: null,
      };

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json(errorBody);
      return;
    }

    console.error('Unhandled exception:', exception);

    const errorBody: IApiErrorResponse = {
      success: false,
      message: 'Internal server error',
      data: null,
    };

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(errorBody);
  }

  private mapPrismaError(
    exception: Prisma.PrismaClientKnownRequestError,
  ): { status: number; body: IApiErrorResponse } {
    switch (exception.code) {
      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          body: {
            success: false,
            message: 'A record with this value already exists',
            data: {
              errors: [
                {
                  field: (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'field',
                  message: 'Unique constraint violation',
                },
              ],
            },
          },
        };
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          body: {
            success: false,
            message: 'Record not found',
            data: null,
          },
        };
      default:
        return {
          status: HttpStatus.BAD_REQUEST,
          body: {
            success: false,
            message: 'Database operation failed',
            data: null,
          },
        };
    }
  }

  private isTransientDatabaseError(exception: unknown): boolean {
    if (exception instanceof Prisma.PrismaClientInitializationError) {
      return true;
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return TRANSIENT_PRISMA_CODES.has(exception.code);
    }

    return false;
  }

  private extractMessage(response: string | object, fallback: string): string {
    if (typeof response === 'string') return response;

    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = (response as { message: string | string[] }).message;
      return Array.isArray(message) ? message.join(', ') : message;
    }

    return fallback;
  }

  private extractData(response: string | object): IApiErrorResponse['data'] {
    if (typeof response !== 'object' || response === null) return null;

    if ('errors' in response) {
      const errors = (response as { errors: ReadonlyArray<{ field: string; message: string }> })
        .errors;
      return { errors };
    }

    if (Array.isArray((response as { message: unknown }).message)) {
      const messages = (response as { message: string[] }).message;
      return {
        errors: messages.map((msg, index) => ({
          field: `field_${index}`,
          message: msg,
        })),
      };
    }

    return null;
  }
}
