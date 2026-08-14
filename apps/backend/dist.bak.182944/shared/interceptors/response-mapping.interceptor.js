"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseMappingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let ResponseMappingInterceptor = class ResponseMappingInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, rxjs_1.map)((result) => {
            if (this.isApiResponse(result)) {
                return result;
            }
            if (this.isWrappedResponse(result)) {
                return {
                    success: true,
                    message: result.message ?? 'Operation successful',
                    data: result.data,
                    meta: result.meta,
                };
            }
            return {
                success: true,
                message: 'Operation successful',
                data: result,
            };
        }));
    }
    isApiResponse(value) {
        return (typeof value === 'object' &&
            value !== null &&
            'success' in value &&
            value.success === true);
    }
    isWrappedResponse(value) {
        return typeof value === 'object' && value !== null && 'data' in value;
    }
};
exports.ResponseMappingInterceptor = ResponseMappingInterceptor;
exports.ResponseMappingInterceptor = ResponseMappingInterceptor = __decorate([
    (0, common_1.Injectable)()
], ResponseMappingInterceptor);
//# sourceMappingURL=response-mapping.interceptor.js.map