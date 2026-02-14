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
var Payment_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentMethod = exports.PaymentStatus = void 0;
const typeorm_1 = require("typeorm");
const aggregate_root_interface_1 = require("../shared/aggregate-root.interface");
const payment_events_1 = require("./payment.events");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PROCESSING"] = "processing";
    PaymentStatus["COMPLETED"] = "completed";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["CANCELLED"] = "cancelled";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CREDIT_CARD"] = "credit_card";
    PaymentMethod["DEBIT_CARD"] = "debit_card";
    PaymentMethod["BANK_TRANSFER"] = "bank_transfer";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
let Payment = Payment_1 = class Payment extends aggregate_root_interface_1.AggregateRoot {
    static create(tenantId, amount, currency, method, paymentIntentId, provider, subscriptionId) {
        const payment = new Payment_1();
        payment.id = undefined;
        payment.tenantId = tenantId;
        payment.subscriptionId = subscriptionId || null;
        payment.status = PaymentStatus.PENDING;
        payment.method = method;
        payment.amount = amount;
        payment.currency = currency;
        payment.paymentIntentId = paymentIntentId;
        payment.providerTransactionId = null;
        payment.provider = provider;
        payment.metadata = null;
        payment.failureReason = null;
        payment.completedAt = null;
        payment.failedAt = null;
        payment.addDomainEvent(new payment_events_1.PaymentCreatedEvent(payment.id, {
            tenantId: payment.tenantId,
            amount: payment.amount,
            paymentIntentId: payment.paymentIntentId,
        }));
        return payment;
    }
    markAsProcessing() {
        if (this.status !== PaymentStatus.PENDING) {
            throw new Error('Only pending payments can be marked as processing');
        }
        this.status = PaymentStatus.PROCESSING;
    }
    complete(providerTransactionId, metadata) {
        if (this.status === PaymentStatus.COMPLETED) {
            return;
        }
        this.status = PaymentStatus.COMPLETED;
        this.providerTransactionId = providerTransactionId;
        this.completedAt = new Date();
        if (metadata) {
            this.metadata = metadata;
        }
        this.addDomainEvent(new payment_events_1.PaymentCompletedEvent(this.id, {
            tenantId: this.tenantId,
            subscriptionId: this.subscriptionId,
            amount: this.amount,
            providerTransactionId: this.providerTransactionId,
        }));
    }
    fail(reason) {
        if (this.status === PaymentStatus.FAILED) {
            return;
        }
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.failedAt = new Date();
        this.addDomainEvent(new payment_events_1.PaymentFailedEvent(this.id, {
            tenantId: this.tenantId,
            subscriptionId: this.subscriptionId,
            amount: this.amount,
            reason: this.failureReason,
        }));
    }
    cancel() {
        if (this.status === PaymentStatus.CANCELLED) {
            return;
        }
        this.status = PaymentStatus.CANCELLED;
    }
    refund() {
        if (this.status !== PaymentStatus.COMPLETED) {
            throw new Error('Only completed payments can be refunded');
        }
        this.status = PaymentStatus.REFUNDED;
    }
    isCompleted() {
        return this.status === PaymentStatus.COMPLETED;
    }
    isFailed() {
        return this.status === PaymentStatus.FAILED;
    }
    setProviderTransactionId(transactionId) {
        this.providerTransactionId = transactionId;
    }
    updateMetadata(metadata) {
        this.metadata = { ...this.metadata, ...metadata };
    }
};
exports.Payment = Payment;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Payment.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }),
    __metadata("design:type", String)
], Payment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PaymentMethod }),
    __metadata("design:type", String)
], Payment.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payment.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'TRY' }),
    __metadata("design:type", String)
], Payment.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], Payment.prototype, "paymentIntentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "providerTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Payment.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Payment.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Payment.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Payment.prototype, "failedAt", void 0);
exports.Payment = Payment = Payment_1 = __decorate([
    (0, typeorm_1.Entity)('payments'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['paymentIntentId'])
], Payment);
//# sourceMappingURL=payment.entity.js.map