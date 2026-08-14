"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const argon2 = __importStar(require("argon2"));
const uuid_1 = require("uuid");
const shared_1 = require("@helali/shared");
const messages_1 = require("../../shared/constants/messages");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const redis_service_1 = require("../../shared/redis/redis.service");
const auth_repository_1 = require("./auth.repository");
let AuthService = class AuthService {
    authRepository;
    jwtService;
    redisService;
    auditLogsService;
    refreshExpiresInDays = 7;
    constructor(authRepository, jwtService, redisService, auditLogsService) {
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.redisService = redisService;
        this.auditLogsService = auditLogsService;
    }
    async login(dto, ipAddress) {
        await this.checkRateLimit(ipAddress);
        const user = await this.authRepository.findUserByUsername(dto.username);
        if (!user) {
            await this.incrementRateLimit(ipAddress);
            throw new common_1.UnauthorizedException(messages_1.AuthMessage.InvalidCredentials);
        }
        const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
        if (!isPasswordValid) {
            await this.incrementRateLimit(ipAddress);
            throw new common_1.UnauthorizedException(messages_1.AuthMessage.InvalidCredentials);
        }
        await this.clearRateLimit(ipAddress);
        const result = await this.issueTokens(user);
        void this.auditLogsService.create({
            action: 'auth.login',
            entityType: 'User',
            entityId: String(user.id),
            userId: user.id,
            ipAddress,
            changes: { username: user.username },
        });
        return result;
    }
    async register(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.ConflictException(messages_1.BadRequestMessage.PasswordMismatch);
        }
        const existingPhone = await this.authRepository.findUserByPhoneNumber(dto.phoneNumber);
        if (existingPhone) {
            throw new common_1.ConflictException(messages_1.AuthMessage.UserAlreadyExists);
        }
        const existingUsername = await this.authRepository.findUserByUsername(dto.username);
        if (existingUsername) {
            throw new common_1.ConflictException(messages_1.AuthMessage.UserAlreadyExists);
        }
        const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
        await this.authRepository.createUser({
            username: dto.username,
            passwordHash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            phoneNumber: dto.phoneNumber,
            age: dto.age,
            email: dto.email,
        });
        return { message: messages_1.PublicMessage.Registered };
    }
    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new common_1.UnauthorizedException(messages_1.AuthMessage.RefreshTokenNotFound);
        }
        const storedToken = await this.authRepository.findRefreshTokenWithUser(refreshToken);
        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException(messages_1.AuthMessage.RefreshTokenInvalid);
        }
        const newRefreshToken = (0, uuid_1.v4)();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays);
        await this.authRepository.rotateRefreshToken(refreshToken, storedToken.userId, newRefreshToken, expiresAt);
        return this.issueTokens(storedToken.user, newRefreshToken);
    }
    async logout(refreshToken, userId, ipAddress) {
        if (refreshToken) {
            await this.authRepository.revokeRefreshToken(refreshToken);
        }
        if (userId !== undefined) {
            void this.auditLogsService.create({
                action: 'auth.logout',
                entityType: 'User',
                entityId: String(userId),
                userId,
                ipAddress: ipAddress ?? null,
            });
        }
    }
    getProfileFromAuthUser(user) {
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            permissions: [...user.permissions],
        };
    }
    async getProfile(userId) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException(messages_1.AuthMessage.AuthenticationRequired);
        }
        return this.mapUserProfile(user);
    }
    async issueTokens(user, existingRefreshToken) {
        const profile = this.mapUserProfile(user);
        const accessToken = this.generateAccessToken(user);
        let refreshToken = existingRefreshToken;
        if (!refreshToken) {
            refreshToken = (0, uuid_1.v4)();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays);
            await this.authRepository.createRefreshToken(user.id, refreshToken, expiresAt);
        }
        return {
            accessToken,
            refreshToken,
            user: profile,
        };
    }
    generateAccessToken(user) {
        const permissions = [...(0, shared_1.getPermissionsForRole)(user.role)];
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            permissions,
        };
        return this.jwtService.sign(payload);
    }
    mapUserProfile(user) {
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            age: user.age,
            email: user.email,
            role: user.role,
            permissions: [...(0, shared_1.getPermissionsForRole)(user.role)],
        };
    }
    async checkRateLimit(ipAddress) {
        try {
            const isReady = await this.redisService.ensureReady();
            if (!isReady) {
                return;
            }
            const key = `rate_limit:login:${ipAddress}`;
            const attempts = await this.redisService.getClient().get(key);
            const count = attempts ? parseInt(attempts, 10) : 0;
            if (count >= 5) {
                throw new common_1.UnauthorizedException(messages_1.AuthMessage.TooManyLoginAttempts);
            }
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
        }
    }
    async incrementRateLimit(ipAddress) {
        try {
            const isReady = await this.redisService.ensureReady();
            if (!isReady) {
                return;
            }
            const key = `rate_limit:login:${ipAddress}`;
            const client = this.redisService.getClient();
            const count = await client.incr(key);
            if (count === 1) {
                await client.expire(key, 900);
            }
        }
        catch {
        }
    }
    async clearRateLimit(ipAddress) {
        try {
            const isReady = await this.redisService.ensureReady();
            if (!isReady) {
                return;
            }
            await this.redisService.getClient().del(`rate_limit:login:${ipAddress}`);
        }
        catch {
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_repository_1.AuthRepository,
        jwt_1.JwtService,
        redis_service_1.RedisService,
        audit_logs_service_1.AuditLogsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map