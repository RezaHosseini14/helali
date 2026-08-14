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
exports.UsersRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
const userSelect = {
    id: true,
    username: true,
    firstName: true,
    lastName: true,
    phoneNumber: true,
    age: true,
    email: true,
    role: true,
    createdAt: true,
};
let UsersRepository = class UsersRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findMany(input) {
        const skip = (input.page - 1) * input.limit;
        const [items, total] = await Promise.all([
            this.prisma.user.findMany({
                select: userSelect,
                orderBy: { id: 'desc' },
                skip,
                take: input.limit,
            }),
            this.prisma.user.count(),
        ]);
        return { items, total };
    }
    async findById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: userSelect,
        });
    }
    async findByIdWithPassword(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                ...userSelect,
                passwordHash: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
            select: userSelect,
        });
    }
    async delete(id) {
        return this.prisma.user.delete({ where: { id } });
    }
    async countAll() {
        return this.prisma.user.count();
    }
    async countAudios() {
        return this.prisma.audio.count();
    }
    async countVideos() {
        return this.prisma.video.count();
    }
    async countGalleries() {
        return this.prisma.gallery.count();
    }
    async countComments() {
        const [audioComments, galleryComments, videoComments] = await Promise.all([
            this.prisma.audioComment.count(),
            this.prisma.galleryComment.count(),
            this.prisma.videoComment.count(),
        ]);
        return audioComments + galleryComments + videoComments;
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map