import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getOverview(): Promise<{
        message: string;
        data: {
            users: number;
            audios: number;
            videos: number;
            galleries: number;
            comments: number;
        };
    }>;
}
