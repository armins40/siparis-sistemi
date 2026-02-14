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
var Tenant_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tenant = exports.TenantStatus = void 0;
const typeorm_1 = require("typeorm");
const aggregate_root_interface_1 = require("../shared/aggregate-root.interface");
const tenant_events_1 = require("./tenant.events");
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["INACTIVE"] = "inactive";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["TRIAL"] = "trial";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
let Tenant = Tenant_1 = class Tenant extends aggregate_root_interface_1.AggregateRoot {
    static create(name, subdomain, email, phone) {
        const tenant = new Tenant_1();
        tenant.id = undefined;
        tenant.name = name;
        tenant.subdomain = subdomain;
        tenant.email = email;
        tenant.phone = phone || null;
        tenant.status = TenantStatus.TRIAL;
        tenant.settings = {};
        tenant.planId = null;
        tenant.trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        tenant.subscriptionEndsAt = null;
        tenant.addDomainEvent(new tenant_events_1.TenantCreatedEvent(tenant.id, {
            name: tenant.name,
            subdomain: tenant.subdomain,
            email: tenant.email,
        }));
        return tenant;
    }
    activate() {
        if (this.status === TenantStatus.ACTIVE) {
            return;
        }
        const previousStatus = this.status;
        this.status = TenantStatus.ACTIVE;
        this.addDomainEvent(new tenant_events_1.TenantStatusChangedEvent(this.id, {
            previousStatus,
            newStatus: this.status,
        }));
    }
    suspend() {
        if (this.status === TenantStatus.SUSPENDED) {
            return;
        }
        const previousStatus = this.status;
        this.status = TenantStatus.SUSPENDED;
        this.addDomainEvent(new tenant_events_1.TenantStatusChangedEvent(this.id, {
            previousStatus,
            newStatus: this.status,
        }));
    }
    deactivate() {
        if (this.status === TenantStatus.INACTIVE) {
            return;
        }
        const previousStatus = this.status;
        this.status = TenantStatus.INACTIVE;
        this.addDomainEvent(new tenant_events_1.TenantStatusChangedEvent(this.id, {
            previousStatus,
            newStatus: this.status,
        }));
    }
    isActive() {
        return this.status === TenantStatus.ACTIVE;
    }
    isTrial() {
        return this.status === TenantStatus.TRIAL;
    }
    isTrialExpired() {
        if (!this.trialEndsAt) {
            return false;
        }
        return new Date() > this.trialEndsAt;
    }
    updateSettings(settings) {
        this.settings = { ...this.settings, ...settings };
    }
    setPlan(planId) {
        this.planId = planId;
    }
    setSubscriptionEndsAt(date) {
        this.subscriptionEndsAt = date;
    }
};
exports.Tenant = Tenant;
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Tenant.prototype, "subdomain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: TenantStatus, default: TenantStatus.TRIAL }),
    __metadata("design:type", String)
], Tenant.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Tenant.prototype, "settings", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Tenant.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "trialEndsAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Tenant.prototype, "subscriptionEndsAt", void 0);
exports.Tenant = Tenant = Tenant_1 = __decorate([
    (0, typeorm_1.Entity)('tenants'),
    (0, typeorm_1.Index)(['subdomain'], { unique: true }),
    (0, typeorm_1.Index)(['tenantId'])
], Tenant);
//# sourceMappingURL=tenant.entity.js.map