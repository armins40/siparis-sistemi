"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionExpiredEvent = exports.SubscriptionCancelledEvent = exports.SubscriptionActivatedEvent = exports.SubscriptionCreatedEvent = void 0;
const domain_event_interface_1 = require("../shared/domain-event.interface");
class SubscriptionCreatedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'SubscriptionCreated';
        this.aggregateType = 'Subscription';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.SubscriptionCreatedEvent = SubscriptionCreatedEvent;
class SubscriptionActivatedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'SubscriptionActivated';
        this.aggregateType = 'Subscription';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.SubscriptionActivatedEvent = SubscriptionActivatedEvent;
class SubscriptionCancelledEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'SubscriptionCancelled';
        this.aggregateType = 'Subscription';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.SubscriptionCancelledEvent = SubscriptionCancelledEvent;
class SubscriptionExpiredEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'SubscriptionExpired';
        this.aggregateType = 'Subscription';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.SubscriptionExpiredEvent = SubscriptionExpiredEvent;
//# sourceMappingURL=subscription.events.js.map