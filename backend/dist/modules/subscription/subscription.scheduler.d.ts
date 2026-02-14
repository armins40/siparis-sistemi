import { SubscriptionService } from './subscription.service';
import { TenantService } from '../tenant/tenant.service';
export declare class SubscriptionScheduler {
    private subscriptionService;
    private tenantService;
    private readonly logger;
    constructor(subscriptionService: SubscriptionService, tenantService: TenantService);
    checkExpiredSubscriptions(): Promise<void>;
    checkTrialExpiration(): Promise<void>;
}
