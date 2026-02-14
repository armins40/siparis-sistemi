import { TenantBaseEntity } from '../../../shared/base/base.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { SubscriptionStatus, SubscriptionPlan } from '../../../shared/constants';
export declare class Subscription extends TenantBaseEntity {
    tenant: Tenant;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    cancelledAt?: Date;
    renewedAt?: Date;
    amount: number;
    paymentIntentId?: string;
    autoRenew: boolean;
    metadata?: Record<string, any>;
}
