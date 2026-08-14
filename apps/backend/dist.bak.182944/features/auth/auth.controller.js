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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const shared_1 = require("@helali/shared");
const auth_decorators_1 = require("../../shared/decorators/auth.decorators");
const public_decorator_1 = require("../../shared/decorators/public.decorator");
const messages_1 = require("../../shared/constants/messages");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
let AuthController = class AuthController {
    authService;
    configService;
    constructor(authService, configService) {
        this.authService = authService;
        this.configService = configService;
    }
    async login(dto, request, response) {
        const ipAddress = request.ip ?? 'unknown';
        const result = await this.authService.login(dto, ipAddress);
        this.setRefreshCookie(response, result.refreshToken);
        return {
            message: 'ورود موفق',
            data: {
                accessToken: result.accessToken,
                user: result.user,
            },
        };
    }
    async refresh(request, response) {
        const refreshToken = request.cookies?.[shared_1.REFRESH_TOKEN_COOKIE];
        try {
            const result = await this.authService.refresh(refreshToken ?? '');
            this.setRefreshCookie(response, result.refreshToken);
            return {
                message: 'توکن جدید صادر شد',
                data: {
                    accessToken: result.accessToken,
                    user: result.user,
                },
            };
        }
        catch (error) {
            this.clearRefreshCookie(response);
            throw error;
        }
    }
    async logout(request, response, user) {
        const refreshToken = request.cookies?.[shared_1.REFRESH_TOKEN_COOKIE];
        const ipAddress = request.ip ?? 'unknown';
        await this.authService.logout(refreshToken, user.id, ipAddress);
        this.clearRefreshCookie(response);
        return {
            message: messages_1.PublicMessage.LoggedOut,
            data: null,
        };
    }
    async getProfile(user) {
        const data = await this.authService.getProfile(user.id);
        return {
            message: 'پروفایل دریافت شد',
            data,
        };
    }
    async register(dto) {
        const result = await this.authService.register(dto);
        return {
            message: result.message,
            data: null,
        };
    }
    setRefreshCookie(response, token) {
        response.cookie(shared_1.REFRESH_TOKEN_COOKIE, token, {
            httpOnly: true,
            secure: this.isCookieSecure(),
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });
    }
    clearRefreshCookie(response) {
        response.clearCookie(shared_1.REFRESH_TOKEN_COOKIE, {
            httpOnly: true,
            secure: this.isCookieSecure(),
            sameSite: 'lax',
            path: '/',
        });
    }
    isCookieSecure() {
        return this.configService.get('app.cookieSecure', false);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map