import { DashboardRepository } from './dashboard.repository';
export declare class DashboardService {
    private readonly dashboardRepository;
    constructor(dashboardRepository: DashboardRepository);
    getOverview(): Promise<{
        users: number;
        audios: number;
        videos: number;
        galleries: number;
        comments: number;
    }>;
}
