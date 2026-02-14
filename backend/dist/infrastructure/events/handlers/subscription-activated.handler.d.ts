import { IEventHandler } from '../../../application/shared/event-handler.interface';
import { SubscriptionActivatedEvent } from '../../../domain/subscription/subscription.events';
import { InvoiceRepository } from '../../database/repositories/invoice.repository';
export declare class SubscriptionActivatedHandler implements IEventHandler<SubscriptionActivatedEvent> {
    private readonly invoiceRepository;
    private readonly logger;
    constructor(invoiceRepository: InvoiceRepository);
    handle(event: SubscriptionActivatedEvent): Promise<void>;
}
