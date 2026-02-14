import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { IDomainEvent } from '../../domain/shared/domain-event.interface';
import { EventBusService } from './event-bus.service';
export declare class EventProcessor extends WorkerHost {
    private readonly eventBus?;
    private readonly logger;
    constructor(eventBus?: EventBusService);
    process(job: Job<IDomainEvent>): Promise<void>;
}
