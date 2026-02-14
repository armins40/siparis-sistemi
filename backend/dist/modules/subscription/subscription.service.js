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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const constants_1 = require("../../shared/constants");
const tenant_service_1 = require("../tenant/tenant.service");
let SubscriptionService = class SubscriptionService {
    constructor(subscriptionRepository, tenantService) {
        this.subscriptionRepository = subscriptionRepository;
        this.tenantService = tenantService;
    }
    async create(tenantId, plan, amount, paymentIntentId) {
        const startDate = new Date();
        const endDate = new Date();
        if (plan === constants_1.SubscriptionPlan.MONTHLY) {
            endDate.setMonth(endDate.getMonth() + 1);
        }
        else if (plan === constants_1.SubscriptionPlan.YEARLY) {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }
        await this.cancelActiveSubscriptions(tenantId);
        const subscription = this.subscriptionRepository.create({
            tenantId,
            plan,
            status: constants_1.SubscriptionStatus.ACTIVE,
            startDate,
            endDate,
            amount,
            paymentIntentId,
            autoRenew: true,
        });
        const savedSubscription = await this.subscriptionRepository.save(subscription);
        await this.tenantService.updateSubscriptionStatus(tenantId, constants_1.SubscriptionStatus.ACTIVE);
        return savedSubscription;
    }
    async getActiveSubscription(tenantId) {
        return this.subscriptionRepository.findOne({
            where: {
                tenantId,
                status: constants_1.SubscriptionStatus.ACTIVE,
                endDate: (0, typeorm_2.MoreThan)(new Date()),
            },
            order: { createdAt: 'DESC' },
        });
    }
    async getAllSubscriptions(tenantId) {
        return this.subscriptionRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
    }
    async cancel(tenantId) {
        const subscription = await this.getActiveSubscription(tenantId);
        if (!subscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        subscription.status = constants_1.SubscriptionStatus.CANCELLED;
        subscription.cancelledAt = new Date();
        subscription.autoRenew = false;
        await this.subscriptionRepository.save(subscription);
        await this.tenantService.updateSubscriptionStatus(tenantId, constants_1.SubscriptionStatus.CANCELLED);
        return subscription;
    }
    async renew(tenantId) {
        const currentSubscription = await this.getActiveSubscription(tenantId);
        if (!currentSubscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        if (currentSubscription.autoRenew === false) {
            throw new common_1.BadRequestException('Auto-renew is disabled for this subscription');
        }
        const newSubscription = await this.create(tenantId, currentSubscription.plan, currentSubscription.amount);
        currentSubscription.renewedAt = new Date();
        await this.subscriptionRepository.save(currentSubscription);
        return newSubscription;
    }
    async checkExpiredSubscriptions() {
        const expiredSubscriptions = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .where('subscription.status = :status', {
            status: constants_1.SubscriptionStatus.ACTIVE,
        })
            .andWhere('subscription.endDate < :now', { now: new Date() })
            .getMany();
        for (const subscription of expiredSubscriptions) {
            subscription.status = constants_1.SubscriptionStatus.EXPIRED;
            await this.subscriptionRepository.save(subscription);
            await this.tenantService.updateSubscriptionStatus(subscription.tenantId, constants_1.SubscriptionStatus.EXPIRED);
        }
    }
    async cancelActiveSubscriptions(tenantId) {
        const activeSubscriptions = await this.subscriptionRepository.find({
            where: {
                tenantId,
                status: constants_1.SubscriptionStatus.ACTIVE,
            },
        });
        for (const sub of activeSubscriptions) {
            sub.status = constants_1.SubscriptionStatus.CANCELLED;
            sub.cancelledAt = new Date();
            await this.subscriptionRepository.save(sub);
        }
    }
    async canAccess(tenantId) {
        const tenant = await this.tenantService.findOne(tenantId);
        if (!tenant.isActive) {
            return false;
        }
        if (tenant.subscriptionStatus === constants_1.SubscriptionStatus.TRIAL) {
            if (tenant.trialEndsAt && tenant.trialEndsAt > new Date()) {
                return true;
            }
            return false;
        }
        const activeSubscription = await this.getActiveSubscription(tenantId);
        return activeSubscription !== null;
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tenant_service_1.TenantService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map