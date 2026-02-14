import { ICommand } from '../shared/use-case.interface';
import { ISubscriptionRepository } from '../../domain/subscription/subscription.repository.interface';
import { ITenantRepository } from '../../domain/tenant/tenant.repository.interface';
export interface ActivateSubscriptionRequest {
    subscriptionId: string;
    tenantId: string;
    endsAt: Date;
}
export interface ActivateSubscriptionResponse {
    subscription: {
        id: string;
        status: string;
        endsAt: Date;
    };
}
export declare class ActivateSubscriptionUseCase implements ICommand<ActivateSubscriptionRequest, ActivateSubscriptionResponse> {
    private readonly subscriptionRepository;
    private readonly tenantRepository;
    constructor(subscriptionRepository: ISubscriptionRepository, tenantRepository: ITenantRepository);
    execute(request: ActivateSubscriptionRequest): Promise<ActivateSubscriptionResponse>;
}
