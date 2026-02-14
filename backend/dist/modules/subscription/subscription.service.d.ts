import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { SubscriptionPlan } from '../../shared/constants';
import { TenantService } from '../tenant/tenant.service';
export declare class SubscriptionService {
    private subscriptionRepository;
    private tenantService;
    constructor(subscriptionRepository: Repository<Subscription>, tenantService: TenantService);
    create(tenantId: string, plan: SubscriptionPlan, amount: number, paymentIntentId?: string): Promise<Subscription>;
    getActiveSubscription(tenantId: string): Promise<Subscription | null>;
    getAllSubscriptions(tenantId: string): Promise<Subscription[]>;
    cancel(tenantId: string): Promise<Subscription>;
    renew(tenantId: string): Promise<Subscription>;
    checkExpiredSubscriptions(): Promise<void>;
    private cancelActiveSubscriptions;
    canAccess(tenantId: string): Promise<boolean>;
}
