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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const userAuthSelect = {
    id: true,
    username: true,
    passwordHash: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    age: true,
    email: true,
    role: true,
    createdAt: true,
};
let AuthRepository = class AuthRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUserByUsername(username) {
        return this.prisma.user.findUnique({
            where: { username },
            select: userAuthSelect,
        });
    }
    async findUserByPhoneNumber(phoneNumber) {
        return this.prisma.user.findFirst({
            where: { phoneNumber },
            select: { id: true },
        });
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: userAuthSelect,
        });
    }
    async createUser(data) {
        return this.prisma.user.create({
            data: {
                username: data.username,
                passwordHash: data.passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phoneNumber,
                age: data.age,
                email: data.email,
            },
        });
    }
    async createRefreshToken(userId, token, expiresAt) {
        return this.prisma.refreshToken.create({
            data: { userId, token, expiresAt },
        });
    }
    async findRefreshTokenWithUser(token) {
        return this.prisma.refreshToken.findUnique({
            where: { token },
            include: {
                user: {
                    select: userAuthSelect,
                },
            },
        });
    }
    async rotateRefreshToken(oldToken, userId, newToken, expiresAt) {
        await this.prisma.$transaction([
            this.prisma.refreshToken.updateMany({
                where: { token: oldToken, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
            this.prisma.refreshToken.create({
                data: { userId, token: newToken, expiresAt },
            }),
        ]);
    }
    async revokeRefreshToken(token) {
        await this.prisma.refreshToken.updateMany({
            where: { token, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
    async revokeAllUserTokens(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map