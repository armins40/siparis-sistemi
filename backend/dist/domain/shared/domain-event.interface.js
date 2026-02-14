"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
class DomainEvent {
    constructor() {
        this.eventId = this.generateEventId();
        this.occurredOn = new Date();
    }
    generateEventId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.interface.js.map