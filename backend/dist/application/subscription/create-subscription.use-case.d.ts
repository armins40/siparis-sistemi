import { ICommand } from '../shared/use-case.interface';
import { SubscriptionPlan } from '../../domain/subscription/subscription.entity';
import { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.interface';
import { ITenantRepository } from '../../domain/tenant/tenant.repository.interface';
export interface CreateSubscriptionRequest {
    tenantId: string;
    plan: SubscriptionPlan;
    amount: number;
    currency?: string;
}
export interface CreateSubscriptionResponse {
    subscription: {
        id: string;
        tenantId: string;
        plan: string;
        status: string;
        amount: number;
        currency: string;
    };
}
export declare class CreateSubscriptionUseCase implements ICommand<CreateSubscriptionRequest, CreateSubscriptionResponse> {
    private readonly subscriptionRepository;
    private readonly tenantRepository;
    constructor(subscriptionRepository: ISubscriptionRepository, tenantRepository: ITenantRepository);
    execute(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse>;
}
