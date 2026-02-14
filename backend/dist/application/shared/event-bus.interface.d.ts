import { IDomainEvent } from '../../domain/shared/domain-event.interface';
import { IEventHandler } from './event-handler.interface';
export interface IEventBus {
    publish<T extends IDomainEvent>(event: T): Promise<void>;
    subscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void;
    unsubscribe<T extends IDomainEvent>(eventType: string, handler: IEventHandler<T>): void;
}
