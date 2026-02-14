"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var EventProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const event_bus_service_1 = require("./event-bus.service");
let EventProcessor = EventProcessor_1 = class EventProcessor extends bullmq_1.WorkerHost {
    constructor(eventBus) {
        super();
        this.eventBus = eventBus;
        this.logger = new common_1.Logger(EventProcessor_1.name);
    }
    async process(job) {
        if (!this.eventBus) {
            this.logger.warn('EventBus not available, skipping event processing');
            return;
        }
        const event = job.data;
        this.logger.debug(`Processing event: ${event.eventType}`, {
            eventId: event.eventId,
            aggregateId: event.aggregateId,
        });
        try {
            await this.eventBus.publish(event);
            this.logger.log(`Successfully processed event: ${event.eventType}`);
        }
        catch (error) {
            this.logger.error(`Failed to process event: ${event.eventType}`, error);
            throw error;
        }
    }
};
exports.EventProcessor = EventProcessor;
exports.EventProcessor = EventProcessor = EventProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('events'),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [event_bus_service_1.EventBusService])
], EventProcessor);
//# sourceMappingURL=event.processor.js.map