import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from '../../../domain/subscription/subscription.entity';
import { ISubscriptionRepository } from '../../../domain/subscription/subscription.repository.interface';
import { TypeOrmBaseRepository } from '../typeorm-base.repository';
export declare class SubscriptionRepository extends TypeOrmBaseRepository<Subscription> implements ISubscriptionRepository {
    constructor(repository: Repository<Subscription>);
    findByTenantId(tenantId: string): Promise<Subscription | null>;
    findActiveByTenantId(tenantId: string): Promise<Subscription | null>;
    findByStatus(status: SubscriptionStatus): Promise<Subscription[]>;
    findByPlan(plan: SubscriptionPlan): Promise<Subscription[]>;
    findExpiringSubscriptions(daysBeforeExpiry: number): Promise<Subscription[]>;
    findExpiredSubscriptions(): Promise<Subscription[]>;
}
