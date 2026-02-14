import { DomainEvent } from '../shared/domain-event.interface';
export declare class InvoiceCreatedEvent extends DomainEvent {
    readonly eventType = "InvoiceCreated";
    readonly aggregateType = "Invoice";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        invoiceNumber: string;
        total: number;
    };
    constructor(aggregateId: string, payload: InvoiceCreatedEvent['payload']);
}
export declare class InvoiceSentEvent extends DomainEvent {
    readonly eventType = "InvoiceSent";
    readonly aggregateType = "Invoice";
    readonly aggregateId: string;
    readonly payload: {
        tenantId: string;
        invoiceNumber: string;
        sentAt: string;
    };
    constructor(aggregateId: string, payload: InvoiceSentEvent['payload']);
}
