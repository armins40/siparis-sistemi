export interface IDomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    readonly eventType: string;
    readonly aggregateId: string;
    readonly aggregateType: string;
    readonly payload: Record<string, any>;
}
export declare abstract class DomainEvent implements IDomainEvent {
    readonly eventId: string;
    readonly occurredOn: Date;
    abstract readonly eventType: string;
    abstract readonly aggregateId: string;
    abstract readonly aggregateType: string;
    abstract readonly payload: Record<string, any>;
    constructor();
    private generateEventId;
}
