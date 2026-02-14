import { DomainEvent } from '../shared/domain-event.interface';
export declare class TenantCreatedEvent extends DomainEvent {
    readonly eventType = "TenantCreated";
    readonly aggregateType = "Tenant";
    readonly aggregateId: string;
    readonly payload: {
        name: string;
        subdomain: string;
        email: string;
    };
    constructor(aggregateId: string, payload: TenantCreatedEvent['payload']);
}
export declare class TenantStatusChangedEvent extends DomainEvent {
    readonly eventType = "TenantStatusChanged";
    readonly aggregateType = "Tenant";
    readonly aggregateId: string;
    readonly payload: {
        previousStatus: string;
        newStatus: string;
    };
    constructor(aggregateId: string, payload: TenantStatusChangedEvent['payload']);
}
