import { Subscription, SubscriptionStatus, SubscriptionPlan } from './subscription.entity';
import { IBaseRepository } from '../shared/repository.interface';
export interface ISubscriptionRepository extends IBaseRepository<Subscription> {
    findByTenantId(tenantId: string): Promise<Subscription | null>;
    findActiveByTenantId(tenantId: string): Promise<Subscription | null>;
    findByStatus(status: SubscriptionStatus): Promise<Subscription[]>;
    findByPlan(plan: SubscriptionPlan): Promise<Subscription[]>;
    findExpiringSubscriptions(daysBeforeExpiry: number): Promise<Subscription[]>;
    findExpiredSubscriptions(): Promise<Subscription[]>;
}
