import { Repository } from 'typeorm';
import { Tenant } from '../tenant/entities/tenant.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Order } from '../order/entities/order.entity';
import { User } from '../auth/entities/user.entity';
import { TenantService } from '../tenant/tenant.service';
export interface DashboardStats {
    totalTenants: number;
    activeSubscriptions: number;
    trialTenants: number;
    ordersToday: number;
    ordersMonthly: number;
    revenueMonthly: number;
    monthlyOrdersChart: {
        date: string;
        count: number;
    }[];
    monthlyRevenueChart: {
        date: string;
        amount: number;
    }[];
    recentTenants: Partial<Tenant>[];
    recentCancelledSubscriptions: Array<{
        id: string;
        tenantId: string;
        tenantName: string;
        plan: string;
        cancelledAt: Date;
    }>;
}
export interface TenantListQuery {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}
export interface PaginatedTenants {
    data: Tenant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class AdminService {
    private tenantRepo;
    private subscriptionRepo;
    private paymentRepo;
    private orderRepo;
    private userRepo;
    private tenantService;
    constructor(tenantRepo: Repository<Tenant>, subscriptionRepo: Repository<Subscription>, paymentRepo: Repository<Payment>, orderRepo: Repository<Order>, userRepo: Repository<User>, tenantService: TenantService);
    getDashboardStats(): Promise<DashboardStats>;
    getTenants(query: TenantListQuery): Promise<PaginatedTenants>;
    getTenantById(id: string): Promise<Tenant>;
    suspendTenant(id: string): Promise<Tenant>;
    activateTenant(id: string): Promise<Tenant>;
    getTenantStats(tenantId: string): Promise<{
        orderCount: number;
        productCount?: number;
        subscription: Subscription | null;
    }>;
}
