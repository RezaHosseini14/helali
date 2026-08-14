import { UsersRepository } from '@/features/users/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';
export declare class DashboardRepository {
    private readonly prisma;
    private readonly usersRepository;
    constructor(prisma: PrismaService, usersRepository: UsersRepository);
    getOverviewCounts(): Promise<{
        users: number;
        audios: number;
        videos: number;
        galleries: number;
        comments: number;
    }>;
}
