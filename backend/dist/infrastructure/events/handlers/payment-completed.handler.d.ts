import { IEventHandler } from '../../../application/shared/event-handler.interface';
import { PaymentCompletedEvent } from '../../../domain/payment/payment.events';
import { SubscriptionRepository } from '../../database/repositories/subscription.repository';
export declare class PaymentCompletedHandler implements IEventHandler<PaymentCompletedEvent> {
    private readonly subscriptionRepository;
    private readonly logger;
    constructor(subscriptionRepository: SubscriptionRepository);
    handle(event: PaymentCompletedEvent): Promise<void>;
}
