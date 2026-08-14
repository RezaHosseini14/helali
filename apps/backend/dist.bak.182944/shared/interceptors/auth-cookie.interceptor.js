"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthCookieInterceptor = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const shared_1 = require("@helali/shared");
const rxjs_1 = require("rxjs");
let AuthCookieInterceptor = class AuthCookieInterceptor {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    intercept(context, next) {
        const response = context.switchToHttp().getResponse();
        const request = context.switchToHttp().getRequest();
        const isRefreshRoute = request.url?.includes('/auth/refresh') ?? false;
        return next.handle().pipe((0, rxjs_1.tap)((result) => {
            this.applyCookieActions(response, result);
        }), (0, rxjs_1.catchError)((error) => {
            if (isRefreshRoute && error instanceof common_1.UnauthorizedException) {
                this.clearRefreshCookie(response);
            }
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
    applyCookieActions(response, result) {
        if (!this.isAuthCookieResponse(result)) {
            return;
        }
        if (result._setRefreshToken) {
            response.cookie(shared_1.REFRESH_TOKEN_COOKIE, result._setRefreshToken, {
                httpOnly: true,
                secure: this.configService.get('app.cookieSecure', false),
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });
            delete result._setRefreshToken;
        }
        if (result._clearRefreshToken) {
            this.clearRefreshCookie(response);
            delete result._clearRefreshToken;
        }
    }
    clearRefreshCookie(response) {
        response.clearCookie(shared_1.REFRESH_TOKEN_COOKIE, {
            httpOnly: true,
            secure: this.configService.get('app.cookieSecure', false),
            sameSite: 'strict',
            path: '/',
        });
    }
    isAuthCookieResponse(value) {
        return typeof value === 'object' && value !== null;
    }
};
exports.AuthCookieInterceptor = AuthCookieInterceptor;
exports.AuthCookieInterceptor = AuthCookieInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AuthCookieInterceptor);
//# sourceMappingURL=auth-cookie.interceptor.js.map