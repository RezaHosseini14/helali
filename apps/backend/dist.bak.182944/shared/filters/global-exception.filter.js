"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const TRANSIENT_PRISMA_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017']);
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const response = host.switchToHttp().getResponse();
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            const errorBody = {
                success: false,
                message: this.extractMessage(exceptionResponse, exception.message),
                data: this.extractData(exceptionResponse),
            };
            response.status(status).json(errorBody);
            return;
        }
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            const errorBody = this.mapPrismaError(exception);
            response.status(errorBody.status).json(errorBody.body);
            return;
        }
        if (this.isTransientDatabaseError(exception)) {
            console.error('Database unavailable:', exception);
            const errorBody = {
                success: false,
                message: 'Database temporarily unavailable. Please retry.',
                data: null,
            };
            response.status(common_1.HttpStatus.SERVICE_UNAVAILABLE).json(errorBody);
            return;
        }
        console.error('Unhandled exception:', exception);
        const errorBody = {
            success: false,
            message: 'Internal server error',
            data: null,
        };
        response.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json(errorBody);
    }
    mapPrismaError(exception) {
        switch (exception.code) {
            case 'P2002':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    body: {
                        success: false,
                        message: 'A record with this value already exists',
                        data: {
                            errors: [
                                {
                                    field: exception.meta?.target?.join(', ') ?? 'field',
                                    message: 'Unique constraint violation',
                                },
                            ],
                        },
                    },
                };
            case 'P2025':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    body: {
                        success: false,
                        message: 'Record not found',
                        data: null,
                    },
                };
            default:
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    body: {
                        success: false,
                        message: 'Database operation failed',
                        data: null,
                    },
                };
        }
    }
    isTransientDatabaseError(exception) {
        if (exception instanceof client_1.Prisma.PrismaClientInitializationError) {
            return true;
        }
        if (exception instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            return TRANSIENT_PRISMA_CODES.has(exception.code);
        }
        return false;
    }
    extractMessage(response, fallback) {
        if (typeof response === 'string')
            return response;
        if (typeof response === 'object' && response !== null && 'message' in response) {
            const message = response.message;
            return Array.isArray(message) ? message.join(', ') : message;
        }
        return fallback;
    }
    extractData(response) {
        if (typeof response !== 'object' || response === null)
            return null;
        if ('errors' in response) {
            const errors = response
                .errors;
            return { errors };
        }
        if (Array.isArray(response.message)) {
            const messages = response.message;
            return {
                errors: messages.map((msg, index) => ({
                    field: `field_${index}`,
                    message: msg,
                })),
            };
        }
        return null;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    (0, common_1.Injectable)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map