"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceSentEvent = exports.InvoiceCreatedEvent = void 0;
const domain_event_interface_1 = require("../shared/domain-event.interface");
class InvoiceCreatedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'InvoiceCreated';
        this.aggregateType = 'Invoice';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.InvoiceCreatedEvent = InvoiceCreatedEvent;
class InvoiceSentEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'InvoiceSent';
        this.aggregateType = 'Invoice';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.InvoiceSentEvent = InvoiceSentEvent;
//# sourceMappingURL=invoice.events.js.map