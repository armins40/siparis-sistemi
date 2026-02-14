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
var SubscriptionScheduler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionScheduler = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const subscription_service_1 = require("./subscription.service");
const tenant_service_1 = require("../tenant/tenant.service");
const common_2 = require("@nestjs/common");
let SubscriptionScheduler = SubscriptionScheduler_1 = class SubscriptionScheduler {
    constructor(subscriptionService, tenantService) {
        this.subscriptionService = subscriptionService;
        this.tenantService = tenantService;
        this.logger = new common_2.Logger(SubscriptionScheduler_1.name);
    }
    async checkExpiredSubscriptions() {
        this.logger.log('Checking expired subscriptions...');
        await this.subscriptionService.checkExpiredSubscriptions();
    }
    async checkTrialExpiration() {
        this.logger.log('Checking trial expiration...');
        await this.tenantService.checkTrialExpiration();
    }
};
exports.SubscriptionScheduler = SubscriptionScheduler;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionScheduler.prototype, "checkExpiredSubscriptions", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionScheduler.prototype, "checkTrialExpiration", null);
exports.SubscriptionScheduler = SubscriptionScheduler = SubscriptionScheduler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService,
        tenant_service_1.TenantService])
], SubscriptionScheduler);
//# sourceMappingURL=subscription.scheduler.js.map