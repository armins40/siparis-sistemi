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
var Subscription_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = exports.SubscriptionPlan = exports.SubscriptionStatus = void 0;
const typeorm_1 = require("typeorm");
const aggregate_root_interface_1 = require("../shared/aggregate-root.interface");
const subscription_events_1 = require("./subscription.events");
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["TRIAL"] = "trial";
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["EXPIRED"] = "expired";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["SUSPENDED"] = "suspended";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var SubscriptionPlan;
(function (SubscriptionPlan) {
    SubscriptionPlan["MONTHLY"] = "monthly";
    SubscriptionPlan["YEARLY"] = "yearly";
})(SubscriptionPlan || (exports.SubscriptionPlan = SubscriptionPlan = {}));
let Subscription = Subscription_1 = class Subscription extends aggregate_root_interface_1.AggregateRoot {
    static create(tenantId, plan, amount, currency = 'TRY') {
        const subscription = new Subscription_1();
        subscription.id = undefined;
        subscription.tenantId = tenantId;
        subscription.plan = plan;
        subscription.status = SubscriptionStatus.TRIAL;
        subscription.startsAt = new Date();
        subscription.endsAt = null;
        subscription.cancelledAt = null;
        subscription.autoRenew = false;
        subscription.amount = amount;
        subscription.currency = currency;
        subscription.paymentIntentId = null;
        subscription.addDomainEvent(new subscription_events_1.SubscriptionCreatedEvent(subscription.id, {
            tenantId: subscription.tenantId,
            plan: subscription.plan,
            amount: subscription.amount,
        }));
        return subscription;
    }
    activate(endsAt) {
        if (this.status === SubscriptionStatus.ACTIVE) {
            return;
        }
        const previousStatus = this.status;
        this.status = SubscriptionStatus.ACTIVE;
        this.endsAt = endsAt;
        this.addDomainEvent(new subscription_events_1.SubscriptionActivatedEvent(this.id, {
            tenantId: this.tenantId,
            plan: this.plan,
            endsAt: this.endsAt.toISOString(),
        }));
    }
    cancel() {
        if (this.status === SubscriptionStatus.CANCELLED) {
            return;
        }
        const previousStatus = this.status;
        this.status = SubscriptionStatus.CANCELLED;
        this.cancelledAt = new Date();
        this.autoRenew = false;
        this.addDomainEvent(new subscription_events_1.SubscriptionCancelledEvent(this.id, {
            tenantId: this.tenantId,
            cancelledAt: this.cancelledAt.toISOString(),
        }));
    }
    expire() {
        if (this.status === SubscriptionStatus.EXPIRED) {
            return;
        }
        const previousStatus = this.status;
        this.status = SubscriptionStatus.EXPIRED;
        this.addDomainEvent(new subscription_events_1.SubscriptionExpiredEvent(this.id, {
            tenantId: this.tenantId,
            expiredAt: new Date().toISOString(),
        }));
    }
    suspend() {
        if (this.status === SubscriptionStatus.SUSPENDED) {
            return;
        }
        this.status = SubscriptionStatus.SUSPENDED;
    }
    isActive() {
        return this.status === SubscriptionStatus.ACTIVE;
    }
    isExpired() {
        if (!this.endsAt) {
            return false;
        }
        return new Date() > this.endsAt;
    }
    isTrial() {
        return this.status === SubscriptionStatus.TRIAL;
    }
    setPaymentIntentId(paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    enableAutoRenew() {
        this.autoRenew = true;
    }
    disableAutoRenew() {
        this.autoRenew = false;
    }
    renew(endsAt) {
        if (this.status !== SubscriptionStatus.ACTIVE) {
            throw new Error('Only active subscriptions can be renewed');
        }
        this.endsAt = endsAt;
        this.status = SubscriptionStatus.ACTIVE;
    }
};
exports.Subscription = Subscription;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Subscription.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubscriptionPlan }),
    __metadata("design:type", String)
], Subscription.prototype, "plan", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Subscription.prototype, "startsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Subscription.prototype, "endsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Subscription.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "autoRenew", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Subscription.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'TRY' }),
    __metadata("design:type", String)
], Subscription.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Subscription.prototype, "paymentIntentId", void 0);
exports.Subscription = Subscription = Subscription_1 = __decorate([
    (0, typeorm_1.Entity)('subscriptions'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['status'])
], Subscription);
//# sourceMappingURL=subscription.entity.js.map