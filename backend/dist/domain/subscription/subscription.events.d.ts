import { DomainEvent } from '../shared/domain-event.interface';
export declare class SubscriptionCreatedEvent extends DomainEvent {
    readonly eventType = "SubscriptionCreated";
    readonly aggregateType = "Subscription";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        plan: string;
        amount: number;
    };
    constructor(aggregateId: string, payload: SubscriptionCreatedEvent['payload']);
}
export declare class SubscriptionActivatedEvent extends DomainEvent {
    readonly eventType = "SubscriptionActivated";
    readonly aggregateType = "Subscription";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        plan: string;
        endsAt: string;
    };
    constructor(aggregateId: string, payload: SubscriptionActivatedEvent['payload']);
}
export declare class SubscriptionCancelledEvent extends DomainEvent {
    readonly eventType = "SubscriptionCancelled";
    readonly aggregateType = "Subscription";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        cancelledAt: string;
    };
    constructor(aggregateId: string, payload: SubscriptionCancelledEvent['payload']);
}
export declare class SubscriptionExpiredEvent extends DomainEvent {
    readonly eventType = "SubscriptionExpired";
    readonly aggregateType = "Subscription";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        expiredAt: string;
    };
    constructor(aggregateId: string, payload: SubscriptionExpiredEvent['payload']);
}
