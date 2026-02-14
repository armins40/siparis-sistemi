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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaytrProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const constants_1 = require("../../../shared/constants");
let PaytrProvider = class PaytrProvider {
    constructor(configService) {
        this.configService = configService;
        this.merchantId = this.configService.get('PAYTR_MERCHANT_ID') || '';
        this.merchantKey = this.configService.get('PAYTR_MERCHANT_KEY') || '';
        this.merchantSalt = this.configService.get('PAYTR_MERCHANT_SALT') || '';
        this.baseUrl =
            this.configService.get('NODE_ENV') === 'production'
                ? 'https://www.paytr.com'
                : 'https://www.paytr.com';
    }
    async createPayment(request) {
        const paymentAmount = Math.round(request.amount * 100);
        const hashStr = `${this.merchantId}${request.customerEmail}${paymentAmount}${request.orderId}${this.merchantSalt}`;
        const token = crypto.createHash('sha256').update(hashStr).digest('hex');
        const formData = new URLSearchParams();
        formData.append('merchant_id', this.merchantId);
        formData.append('merchant_key', this.merchantKey);
        formData.append('merchant_salt', this.merchantSalt);
        formData.append('email', request.customerEmail);
        formData.append('payment_amount', paymentAmount.toString());
        formData.append('merchant_oid', request.orderId);
        formData.append('user_name', request.customerName);
        formData.append('user_phone', request.customerPhone || '');
        formData.append('user_basket', JSON.stringify([['Sipariş', paymentAmount]]));
        formData.append('user_address', '');
        formData.append('merchant_ok_url', `${process.env.FRONTEND_URL}/payment/success`);
        formData.append('merchant_fail_url', `${process.env.FRONTEND_URL}/payment/fail`);
        formData.append('timeout_limit', '30');
        formData.append('test_mode', this.configService.get('NODE_ENV') === 'production' ? '0' : '1');
        formData.append('currency', 'TL');
        formData.append('lang', 'tr');
        try {
            const response = await fetch(`${this.baseUrl}/odeme/api/get-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            });
            const result = await response.json();
            if (result.status === 'success') {
                return {
                    success: true,
                    paymentId: request.orderId,
                    redirectUrl: `${this.baseUrl}/odeme/guvenli/${result.token}`,
                    status: constants_1.PaymentStatus.PENDING,
                    metadata: { token: result.token },
                };
            }
            else {
                throw new common_1.BadRequestException(result.reason || 'Payment initialization failed');
            }
        }
        catch (error) {
            throw new common_1.BadRequestException(error instanceof Error ? error.message : 'Payment initialization failed');
        }
    }
    async verifyPayment(request) {
        return {
            success: false,
            status: constants_1.PaymentStatus.PENDING,
            amount: 0,
            currency: 'TL',
        };
    }
    async handleWebhook(payload, signature) {
        const hashStr = `${this.merchantSalt}${payload.merchant_oid}${payload.status}${payload.total_amount}`;
        const calculatedHash = crypto
            .createHash('sha256')
            .update(hashStr)
            .digest('base64');
        if (calculatedHash !== payload.hash) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        const status = payload.status === 'success'
            ? constants_1.PaymentStatus.COMPLETED
            : constants_1.PaymentStatus.FAILED;
        return {
            success: payload.status === 'success',
            status,
            amount: parseFloat(payload.total_amount) / 100,
            currency: 'TL',
            transactionId: payload.merchant_oid,
            metadata: payload,
        };
    }
    async refund(paymentId, amount) {
        throw new common_1.BadRequestException('Refund not implemented yet');
    }
};
exports.PaytrProvider = PaytrProvider;
exports.PaytrProvider = PaytrProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PaytrProvider);
//# sourceMappingURL=paytr.provider.js.map