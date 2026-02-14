import { DomainEvent } from './domain-event.interface';
import { BaseEntity } from './base.entity';
export interface IAggregateRoot extends BaseEntity {
    readonly uncommittedEvents: DomainEvent[];
    markEventsAsCommitted(): void;
    clearEvents(): void;
}
export declare abstract class AggregateRoot extends BaseEntity implements IAggregateRoot {
    private readonly _uncommittedEvents;
    get uncommittedEvents(): DomainEvent[];
    protected addDomainEvent(event: DomainEvent): void;
    markEventsAsCommitted(): void;
    clearEvents(): void;
}
