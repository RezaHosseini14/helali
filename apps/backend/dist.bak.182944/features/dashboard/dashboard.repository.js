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
exports.DashboardRepository = void 0;
const common_1 = require("@nestjs/common");
const users_repository_1 = require("../users/users.repository");
const prisma_service_1 = require("../../shared/prisma/prisma.service");
let DashboardRepository = class DashboardRepository {
    prisma;
    usersRepository;
    constructor(prisma, usersRepository) {
        this.prisma = prisma;
        this.usersRepository = usersRepository;
    }
    async getOverviewCounts() {
        const [users, audios, videos, galleries, audioComments, galleryComments, videoComments] = await Promise.all([
            this.usersRepository.countAll(),
            this.usersRepository.countAudios(),
            this.usersRepository.countVideos(),
            this.usersRepository.countGalleries(),
            this.prisma.audioComment.count(),
            this.prisma.galleryComment.count(),
            this.prisma.videoComment.count(),
        ]);
        return {
            users,
            audios,
            videos,
            galleries,
            comments: audioComments + galleryComments + videoComments,
        };
    }
};
exports.DashboardRepository = DashboardRepository;
exports.DashboardRepository = DashboardRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        users_repository_1.UsersRepository])
], DashboardRepository);
//# sourceMappingURL=dashboard.repository.js.map