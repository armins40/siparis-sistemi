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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_entity_1 = require("./entities/payment.entity");
const paytr_provider_1 = require("./providers/paytr.provider");
const constants_1 = require("../../shared/constants");
const uuid_1 = require("uuid");
let PaymentService = class PaymentService {
    constructor(paymentRepository, configService, paytrProvider) {
        this.paymentRepository = paymentRepository;
        this.configService = configService;
        this.paytrProvider = paytrProvider;
        this.providers = new Map();
        this.providers.set('paytr', this.paytrProvider);
    }
    async createPayment(tenantId, request, provider = 'paytr') {
        const paymentProvider = this.providers.get(provider);
        if (!paymentProvider) {
            throw new common_1.BadRequestException(`Payment provider ${provider} not found`);
        }
        const orderId = `ORDER-${(0, uuid_1.v4)()}`;
        const payment = this.paymentRepository.create({
            tenantId,
            provider,
            paymentProviderId: orderId,
            amount: request.amount,
            currency: request.currency || 'TL',
            status: constants_1.PaymentStatus.PENDING,
            customerEmail: request.customerEmail,
            customerName: request.customerName,
            customerPhone: request.customerPhone,
            description: request.description,
            metadata: request.metadata,
        });
        const paymentResponse = await paymentProvider.createPayment({
            ...request,
            orderId,
        });
        payment.paymentProviderId = paymentResponse.paymentId;
        payment.redirectUrl = paymentResponse.redirectUrl;
        payment.status = paymentResponse.status;
        payment.providerResponse = paymentResponse.metadata;
        await this.paymentRepository.save(payment);
        return paymentResponse;
    }
    async verifyPayment(paymentId, provider = 'paytr') {
        const payment = await this.paymentRepository.findOne({
            where: { paymentProviderId: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        const paymentProvider = this.providers.get(provider);
        if (!paymentProvider) {
            throw new common_1.BadRequestException(`Payment provider ${provider} not found`);
        }
        const verification = await paymentProvider.verifyPayment({
            paymentId,
        });
        payment.status = verification.status;
        payment.transactionId = verification.transactionId;
        payment.providerResponse = verification.metadata;
        if (verification.status === constants_1.PaymentStatus.COMPLETED) {
            payment.completedAt = new Date();
        }
        else if (verification.status === constants_1.PaymentStatus.FAILED) {
            payment.failedAt = new Date();
        }
        await this.paymentRepository.save(payment);
    }
    async handleWebhook(provider, payload, signature) {
        const paymentProvider = this.providers.get(provider);
        if (!paymentProvider) {
            throw new common_1.BadRequestException(`Payment provider ${provider} not found`);
        }
        const verification = await paymentProvider.handleWebhook(payload, signature);
        const payment = await this.paymentRepository.findOne({
            where: [
                { paymentProviderId: verification.transactionId },
                { transactionId: verification.transactionId },
            ],
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        payment.status = verification.status;
        payment.transactionId = verification.transactionId;
        payment.providerResponse = verification.metadata;
        if (verification.status === constants_1.PaymentStatus.COMPLETED) {
            payment.completedAt = new Date();
        }
        else if (verification.status === constants_1.PaymentStatus.FAILED) {
            payment.failedAt = new Date();
        }
        await this.paymentRepository.save(payment);
    }
    async getPayment(paymentId) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getPaymentsByTenant(tenantId) {
        return this.paymentRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        paytr_provider_1.PaytrProvider])
], PaymentService);
//# sourceMappingURL=payment.service.js.map