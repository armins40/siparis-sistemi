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
var PayTrProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayTrProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let PayTrProvider = PayTrProvider_1 = class PayTrProvider {
    constructor(configService) {
        this.configService = configService;
        this.name = 'paytr';
        this.logger = new common_1.Logger(PayTrProvider_1.name);
    }
    async createPaymentIntent(params) {
        const merchantId = this.configService.get('PAYTR_MERCHANT_ID');
        const merchantKey = this.configService.get('PAYTR_MERCHANT_KEY');
        const merchantSalt = this.configService.get('PAYTR_MERCHANT_SALT');
        if (!merchantId || !merchantKey || !merchantSalt) {
            throw new Error('PayTR configuration is missing');
        }
        const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const hashString = `${merchantId}${params.amount}${params.currency}${paymentIntentId}${merchantSalt}`;
        const hash = crypto.createHash('sha256').update(hashString).digest('hex');
        this.logger.debug('Creating PayTR payment intent', {
            paymentIntentId,
            amount: params.amount,
        });
        return {
            paymentIntentId,
            redirectUrl: `https://www.paytr.com/odeme/guvenli/${paymentIntentId}`,
            metadata: {
                hash,
                merchantId,
            },
        };
    }
    verifyWebhook(signature, payload) {
        const merchantKey = this.configService.get('PAYTR_MERCHANT_KEY');
        if (!merchantKey) {
            return false;
        }
        const expectedSignature = crypto
            .createHmac('sha256', merchantKey)
            .update(payload)
            .digest('hex');
        return signature === expectedSignature;
    }
    async processWebhook(payload) {
        this.logger.debug('Processing PayTR webhook', payload);
        return {
            transactionId: payload.transaction_id || payload.merchant_oid,
            paymentIntentId: payload.merchant_oid,
            status: payload.status === 'success' ? 'completed' : 'failed',
            amount: parseFloat(payload.total_amount || payload.amount),
            metadata: payload,
        };
    }
    async refund(transactionId, amount) {
        this.logger.debug('Processing PayTR refund', { transactionId, amount });
        return {
            refundId: `refund_${Date.now()}`,
            status: 'completed',
            amount: amount || 0,
        };
    }
};
exports.PayTrProvider = PayTrProvider;
exports.PayTrProvider = PayTrProvider = PayTrProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PayTrProvider);
//# sourceMappingURL=paytr.provider.js.map