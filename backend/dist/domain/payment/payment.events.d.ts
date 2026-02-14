import { DomainEvent } from '../shared/domain-event.interface';
export declare class PaymentCreatedEvent extends DomainEvent {
    readonly eventType = "PaymentCreated";
    readonly aggregateType = "Payment";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        amount: number;
        paymentIntentId: string;
    };
    constructor(aggregateId: string, payload: PaymentCreatedEvent['payload']);
}
export declare class PaymentCompletedEvent extends DomainEvent {
    readonly eventType = "PaymentCompleted";
    readonly aggregateType = "Payment";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        subscriptionId: string | null;
        amount: number;
        providerTransactionId: string;
    };
    constructor(aggregateId: string, payload: PaymentCompletedEvent['payload']);
}
export declare class PaymentFailedEvent extends DomainEvent {
    readonly eventType = "PaymentFailed";
    readonly aggregateType = "Payment";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        subscriptionId: string | null;
        amount: number;
        reason: string;
    };
    constructor(aggregateId: string, payload: PaymentFailedEvent['payload']);
}
