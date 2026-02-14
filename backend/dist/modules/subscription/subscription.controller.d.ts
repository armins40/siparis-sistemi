import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getCurrentSubscription(tenantId: string): Promise<import("./entities/subscription.entity").Subscription>;
    getAllSubscriptions(tenantId: string): Promise<import("./entities/subscription.entity").Subscription[]>;
    cancelSubscription(tenantId: string): Promise<import("./entities/subscription.entity").Subscription>;
    renewSubscription(tenantId: string): Promise<import("./entities/subscription.entity").Subscription>;
}
