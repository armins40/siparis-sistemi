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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessPaymentWebhookUseCase = void 0;
const common_1 = require("@nestjs/common");
const payment_events_1 = require("../../domain/payment/payment.events");
let ProcessPaymentWebhookUseCase = class ProcessPaymentWebhookUseCase {
    constructor(paymentRepository, paymentProvider, eventBus) {
        this.paymentRepository = paymentRepository;
        this.paymentProvider = paymentProvider;
        this.eventBus = eventBus;
    }
    async execute(request) {
        const isValid = this.paymentProvider.verifyWebhook(request.signature, request.payload);
        if (!isValid) {
            throw new Error('Invalid webhook signature');
        }
        const payload = JSON.parse(request.payload);
        const webhookResult = await this.paymentProvider.processWebhook(payload);
        const payment = await this.paymentRepository.findByPaymentIntentId(webhookResult.paymentIntentId);
        if (!payment) {
            throw new Error(`Payment not found for intent ${webhookResult.paymentIntentId}`);
        }
        if (webhookResult.status === 'completed') {
            payment.complete(webhookResult.transactionId, webhookResult.metadata);
            await this.paymentRepository.update(payment);
            await this.eventBus.publish(new payment_events_1.PaymentCompletedEvent(payment.id, {
                tenantId: payment.tenantId,
                subscriptionId: payment.subscriptionId,
                amount: payment.amount,
                providerTransactionId: webhookResult.transactionId,
            }));
            return {
                success: true,
                paymentId: payment.id,
                status: payment.status,
            };
        }
        else if (webhookResult.status === 'failed') {
            payment.fail('Payment failed via webhook');
            await this.paymentRepository.update(payment);
            await this.eventBus.publish(new payment_events_1.PaymentFailedEvent(payment.id, {
                tenantId: payment.tenantId,
                subscriptionId: payment.subscriptionId,
                amount: payment.amount,
                reason: 'Payment failed via webhook',
            }));
            return {
                success: false,
                paymentId: payment.id,
                status: payment.status,
            };
        }
        return {
            success: false,
        };
    }
};
exports.ProcessPaymentWebhookUseCase = ProcessPaymentWebhookUseCase;
exports.ProcessPaymentWebhookUseCase = ProcessPaymentWebhookUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IPaymentRepository')),
    __param(1, (0, common_1.Inject)('IPaymentProvider')),
    __param(2, (0, common_1.Inject)('IEventBus')),
    __metadata("design:paramtypes", [Object, Object, Object])
], ProcessPaymentWebhookUseCase);
//# sourceMappingURL=process-payment-webhook.use-case.js.map