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
exports.SubscriptionRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../../../domain/subscription/subscription.entity");
const typeorm_base_repository_1 = require("../typeorm-base.repository");
let SubscriptionRepository = class SubscriptionRepository extends typeorm_base_repository_1.TypeOrmBaseRepository {
    constructor(repository) {
        super(repository);
    }
    async findByTenantId(tenantId) {
        return this.repository.findOne({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
    }
    async findActiveByTenantId(tenantId) {
        return this.repository.findOne({
            where: { tenantId, status: subscription_entity_1.SubscriptionStatus.ACTIVE },
        });
    }
    async findByStatus(status) {
        return this.repository.find({ where: { status } });
    }
    async findByPlan(plan) {
        return this.repository.find({ where: { plan } });
    }
    async findExpiringSubscriptions(daysBeforeExpiry) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysBeforeExpiry);
        return this.repository
            .createQueryBuilder('subscription')
            .where('subscription.status = :status', { status: subscription_entity_1.SubscriptionStatus.ACTIVE })
            .andWhere('subscription.endsAt <= :expiryDate', { expiryDate })
            .andWhere('subscription.endsAt > :now', { now: new Date() })
            .getMany();
    }
    async findExpiredSubscriptions() {
        return this.repository
            .createQueryBuilder('subscription')
            .where('subscription.status = :status', { status: subscription_entity_1.SubscriptionStatus.ACTIVE })
            .andWhere('subscription.endsAt < :now', { now: new Date() })
            .getMany();
    }
};
exports.SubscriptionRepository = SubscriptionRepository;
exports.SubscriptionRepository = SubscriptionRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubscriptionRepository);
//# sourceMappingURL=subscription.repository.js.map