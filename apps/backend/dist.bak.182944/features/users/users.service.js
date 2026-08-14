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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const argon2 = __importStar(require("argon2"));
const shared_1 = require("@helali/shared");
const messages_1 = require("../../shared/constants/messages");
const access_token_revocation_service_1 = require("../auth/access-token-revocation.service");
const auth_repository_1 = require("../auth/auth.repository");
const audit_logs_service_1 = require("../audit-logs/audit-logs.service");
const users_repository_1 = require("./users.repository");
let UsersService = class UsersService {
    usersRepository;
    authRepository;
    accessTokenRevocationService;
    auditLogsService;
    constructor(usersRepository, authRepository, accessTokenRevocationService, auditLogsService) {
        this.usersRepository = usersRepository;
        this.authRepository = authRepository;
        this.accessTokenRevocationService = accessTokenRevocationService;
        this.auditLogsService = auditLogsService;
    }
    async findAll(page, limit) {
        const { items, total } = await this.usersRepository.findMany({ page, limit });
        if (items.length === 0) {
            throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundUser);
        }
        return {
            items: items.map((item) => this.mapUser(item)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findById(id) {
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundUser);
        }
        return this.mapUser(user);
    }
    getProfile(user) {
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: new Date().toISOString(),
        };
    }
    async getAllDataCount() {
        const [users, audios, videos, galleries, comments] = await Promise.all([
            this.usersRepository.countAll(),
            this.usersRepository.countAudios(),
            this.usersRepository.countVideos(),
            this.usersRepository.countGalleries(),
            this.usersRepository.countComments(),
        ]);
        return {
            users,
            audios,
            videos,
            galleries,
            comments,
        };
    }
    async update(id, dto, actor, ipAddress) {
        const existing = await this.usersRepository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException(messages_1.NotFoundMessage.NotFoundUser);
        }
        if (dto.role !== undefined && dto.role !== existing.role) {
            this.assertCanManageUsers(actor);
        }
        const passwordHash = dto.password
            ? await argon2.hash(dto.password, { type: argon2.argon2id })
            : undefined;
        try {
            const user = await this.usersRepository.update(id, {
                ...(dto.username !== undefined ? { username: dto.username } : {}),
                ...(passwordHash !== undefined ? { passwordHash } : {}),
                ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
                ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
                ...(dto.phoneNumber !== undefined ? { phoneNumber: dto.phoneNumber } : {}),
                ...(dto.age !== undefined ? { age: dto.age } : {}),
                ...(dto.email !== undefined ? { email: dto.email } : {}),
                ...(dto.role !== undefined ? { role: dto.role } : {}),
            });
            if (passwordHash !== undefined || (dto.role !== undefined && dto.role !== existing.role)) {
                await this.revokeUserSessions(id);
            }
            void this.auditLogsService.create({
                action: 'users.update',
                entityType: 'User',
                entityId: String(id),
                userId: actor.id,
                ipAddress: ipAddress ?? null,
                changes: {
                    ...(dto.username !== undefined ? { username: user.username } : {}),
                    ...(dto.firstName !== undefined ? { firstName: user.firstName } : {}),
                    ...(dto.lastName !== undefined ? { lastName: user.lastName } : {}),
                    ...(dto.role !== undefined ? { role: user.role } : {}),
                    ...(passwordHash !== undefined ? { passwordChanged: true } : {}),
                },
            });
            return this.mapUser(user);
        }
        catch {
            throw new common_1.InternalServerErrorException(messages_1.BadRequestMessage.FailedUpdate);
        }
    }
    async remove(id, actor, ipAddress) {
        if (actor.id === id) {
            throw new common_1.BadRequestException('نمی تواندی خودتان را حذف کنید');
        }
        const user = await this.usersRepository.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('کاربر موردنظر یافت نشد');
        }
        await this.usersRepository.delete(id);
        await this.revokeUserSessions(id);
        void this.auditLogsService.create({
            action: 'users.delete',
            entityType: 'User',
            entityId: String(id),
            userId: actor.id,
            ipAddress: ipAddress ?? null,
            changes: { username: user.username, deleted: true },
        });
        return { message: 'کاربر حذف شد' };
    }
    assertCanManageUsers(actor) {
        const ability = (0, shared_1.createAppAbility)({
            id: actor.id,
            role: actor.role,
            permissions: actor.permissions,
        });
        if (!ability.can('manage', 'User')) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
    }
    async revokeUserSessions(userId) {
        this.accessTokenRevocationService.revokeUserSessions(userId);
        await this.authRepository.revokeAllUserTokens(userId);
    }
    mapUser(user) {
        return {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            age: user.age,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        auth_repository_1.AuthRepository,
        access_token_revocation_service_1.AccessTokenRevocationService,
        audit_logs_service_1.AuditLogsService])
], UsersService);
//# sourceMappingURL=users.service.js.map