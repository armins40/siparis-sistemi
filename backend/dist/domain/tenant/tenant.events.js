"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantStatusChangedEvent = exports.TenantCreatedEvent = void 0;
const domain_event_interface_1 = require("../shared/domain-event.interface");
class TenantCreatedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'TenantCreated';
        this.aggregateType = 'Tenant';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.TenantCreatedEvent = TenantCreatedEvent;
class TenantStatusChangedEvent extends domain_event_interface_1.DomainEvent {
    constructor(aggregateId, payload) {
        super();
        this.eventType = 'TenantStatusChanged';
        this.aggregateType = 'Tenant';
        this.aggregateId = aggregateId;
        this.payload = payload;
    }
}
exports.TenantStatusChangedEvent = TenantStatusChangedEvent;
//# sourceMappingURL=tenant.events.js.map