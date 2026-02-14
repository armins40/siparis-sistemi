import { IDomainEvent } from '../../domain/shared/domain-event.interface';
export interface IEventHandler<T extends IDomainEvent> {
    handle(event: T): Promise<void>;
}
