import { TenantBaseEntity } from '../../../shared/base/base.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
export declare class Customer extends TenantBaseEntity {
    tenant: Tenant;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    metadata?: Record<string, any>;
    totalOrders: number;
    totalSpent: number;
}
