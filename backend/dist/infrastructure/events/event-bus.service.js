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
var EventBusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
let EventBusService = EventBusService_1 = class EventBusService {
    constructor(eventQueue) {
        this.eventQueue = eventQueue;
        this.logger = new common_1.Logger(EventBusService_1.name);
        this.handlers = new Map();
    }
    async publish(event) {
        this.logger.debug(`Publishing event: ${event.eventType}`, {
            eventId: event.eventId,
            aggregateId: event.aggregateId,
        });
        if (this.eventQueue) {
            try {
                await this.eventQueue.add(event.eventType, event, {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                });
            }
            catch (error) {
                this.logger.warn('Failed to add event to queue, processing synchronously', error);
            }
        }
        await this.processEvent(event);
    }
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
        this.logger.debug(`Subscribed handler for event: ${eventType}`);
    }
    unsubscribe(eventType, handler) {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                this.logger.debug(`Unsubscribed handler for event: ${eventType}`);
            }
        }
    }
    async processEvent(event) {
        const handlers = this.handlers.get(event.eventType);
        if (!handlers || handlers.length === 0) {
            return;
        }
        const promises = handlers.map((handler) => handler.handle(event).catch((error) => {
            this.logger.error(`Error handling event ${event.eventType}`, error);
            throw error;
        }));
        await Promise.allSettled(promises);
    }
};
exports.EventBusService = EventBusService;
exports.EventBusService = EventBusService = EventBusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, bullmq_1.InjectQueue)('events')),
    __metadata("design:paramtypes", [bullmq_2.Queue])
], EventBusService);
//# sourceMappingURL=event-bus.service.js.map