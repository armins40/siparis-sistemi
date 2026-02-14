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
exports.CreatePaymentIntentUseCase = void 0;
const common_1 = require("@nestjs/common");
const payment_entity_1 = require("../../domain/payment/payment.entity");
const uuid_1 = require("uuid");
let CreatePaymentIntentUseCase = class CreatePaymentIntentUseCase {
    constructor(paymentRepository, paymentProvider) {
        this.paymentRepository = paymentRepository;
        this.paymentProvider = paymentProvider;
    }
    async execute(request) {
        const paymentIntentId = `pi_${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}`;
        const providerResult = await this.paymentProvider.createPaymentIntent({
            amount: request.amount,
            currency: request.currency,
            tenantId: request.tenantId,
            metadata: {
                ...request.metadata,
                subscriptionId: request.subscriptionId,
            },
            returnUrl: request.returnUrl,
            cancelUrl: request.cancelUrl,
        });
        const payment = payment_entity_1.Payment.create(request.tenantId, request.amount, request.currency, request.method, paymentIntentId, this.paymentProvider.name, request.subscriptionId);
        if (providerResult.metadata) {
            payment.updateMetadata(providerResult.metadata);
        }
        const savedPayment = await this.paymentRepository.create(payment);
        return {
            paymentIntent: {
                id: savedPayment.id,
                paymentIntentId: savedPayment.paymentIntentId,
                status: savedPayment.status,
                amount: savedPayment.amount,
                currency: savedPayment.currency,
                clientSecret: providerResult.clientSecret,
                redirectUrl: providerResult.redirectUrl,
            },
        };
    }
};
exports.CreatePaymentIntentUseCase = CreatePaymentIntentUseCase;
exports.CreatePaymentIntentUseCase = CreatePaymentIntentUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IPaymentRepository')),
    __param(1, (0, common_1.Inject)('IPaymentProvider')),
    __metadata("design:paramtypes", [Object, Object])
], CreatePaymentIntentUseCase);
//# sourceMappingURL=create-payment-intent.use-case.js.map