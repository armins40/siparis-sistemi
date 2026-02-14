import { AdminService } from './admin.service';
import { TenantListQueryDto } from './dto/tenant-list-query.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboard(): Promise<import("./admin.service").DashboardStats>;
    getTenants(query: TenantListQueryDto): Promise<import("./admin.service").PaginatedTenants>;
    getTenant(id: string): Promise<import("../tenant/entities/tenant.entity").Tenant>;
    getTenantStats(id: string): Promise<{
        orderCount: number;
        productCount?: number;
        subscription: import("../subscription/entities/subscription.entity").Subscription | null;
    }>;
    suspendTenant(id: string): Promise<import("../tenant/entities/tenant.entity").Tenant>;
    activateTenant(id: string): Promise<import("../tenant/entities/tenant.entity").Tenant>;
}
