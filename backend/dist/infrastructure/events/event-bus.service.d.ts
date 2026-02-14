import { IEventBus } from '../../application/shared/event-bus.interface';
import { IDomainEvent } from '../../domain/shared/domain-event.interface';
import { IEventHandler } from '../../application/shared/event-handler.interface';
import { Queue } from 'bullmq';
export declare class EventBusService implements IEventBus {
    private readonly eventQueue?;
    private readonly logger;
    private readonly handlers;
    constructor(eventQueue?: Queue);
    publish<T extends IDomainEvent>(event: T): Promise<void>;
    subscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void;
    unsubscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void;
    private processEvent;
}
