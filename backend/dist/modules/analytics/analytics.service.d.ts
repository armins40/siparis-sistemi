export declare class AnalyticsService {
    getTenantAnalytics(tenantId: string): Promise<{
        totalOrders: number;
        totalRevenue: number;
        averageOrderValue: number;
    }>;
}
