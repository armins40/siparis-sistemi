"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregateRoot = void 0;
const base_entity_1 = require("./base.entity");
class AggregateRoot extends base_entity_1.BaseEntity {
    constructor() {
        super(...arguments);
        this._uncommittedEvents = [];
    }
    get uncommittedEvents() {
        return [...this._uncommittedEvents];
    }
    addDomainEvent(event) {
        this._uncommittedEvents.push(event);
    }
    markEventsAsCommitted() {
    }
    clearEvents() {
        this._uncommittedEvents.length = 0;
    }
}
exports.AggregateRoot = AggregateRoot;
//# sourceMappingURL=aggregate-root.interface.js.map