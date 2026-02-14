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
var PaymentCompletedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentCompletedHandler = void 0;
const common_1 = require("@nestjs/common");
const subscription_repository_1 = require("../../database/repositories/subscription.repository");
const subscription_entity_1 = require("../../../domain/subscription/subscription.entity");
let PaymentCompletedHandler = PaymentCompletedHandler_1 = class PaymentCompletedHandler {
    constructor(subscriptionRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.logger = new common_1.Logger(PaymentCompletedHandler_1.name);
    }
    async handle(event) {
        this.logger.log(`Handling PaymentCompleted event`, {
            paymentId: event.aggregateId,
            tenantId: event.payload.tenantId,
        });
        if (!event.payload.subscriptionId) {
            this.logger.warn('Payment completed but no subscription ID found');
            return;
        }
        try {
            const subscription = await this.subscriptionRepository.findById(event.payload.subscriptionId, event.payload.tenantId);
            if (!subscription) {
                this.logger.error(`Subscription ${event.payload.subscriptionId} not found`);
                return;
            }
            const endsAt = new Date();
            if (subscription.plan === subscription_entity_1.SubscriptionPlan.MONTHLY) {
                endsAt.setMonth(endsAt.getMonth() + 1);
            }
            else if (subscription.plan === subscription_entity_1.SubscriptionPlan.YEARLY) {
                endsAt.setFullYear(endsAt.getFullYear() + 1);
            }
            subscription.activate(endsAt);
            await this.subscriptionRepository.update(subscription);
            this.logger.log(`Subscription activated successfully`, {
                subscriptionId: subscription.id,
            });
        }
        catch (error) {
            this.logger.error('Error handling PaymentCompleted event', error);
            throw error;
        }
    }
};
exports.PaymentCompletedHandler = PaymentCompletedHandler;
exports.PaymentCompletedHandler = PaymentCompletedHandler = PaymentCompletedHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [subscription_repository_1.SubscriptionRepository])
], PaymentCompletedHandler);
//# sourceMappingURL=payment-completed.handler.js.map