"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentFailedEvent = exports.PaymentCompletedEvent = exports.PaymentCreatedEvent = void 0;
const domain_event_interface_1 = require("../shared/domain-event.interface");
class PaymentCreatedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'PaymentCreated';
        this.aggregateType = 'Payment';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.PaymentCreatedEvent = PaymentCreatedEvent;
class PaymentCompletedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'PaymentCompleted';
        this.aggregateType = 'Payment';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.PaymentCompletedEvent = PaymentCompletedEvent;
class PaymentFailedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'PaymentFailed';
        this.aggregateType = 'Payment';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.PaymentFailedEvent = PaymentFailedEvent;
//# sourceMappingURL=payment.events.js.map