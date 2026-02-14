import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getAnalytics(tenantId: string): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    }>;
}
