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
exports.CreateSubscriptionUseCase = void 0;
const common_1 = require("@nestjs/common");
const subscription_entity_1 = require("../../domain/subscription/subscription.entity");
let CreateSubscriptionUseCase = class CreateSubscriptionUseCase {
    constructor(subscriptionRepository, tenantRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.tenantRepository = tenantRepository;
    }
    async execute(request) {
        const tenant = await this.tenantRepository.findById(request.tenantId, request.tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${request.tenantId} not found`);
        }
        const existingSubscription = await this.subscriptionRepository.findActiveByTenantId(request.tenantId);
        if (existingSubscription) {
            throw new Error(`Tenant ${request.tenantId} already has an active subscription`);
        }
        const subscription = subscription_entity_1.Subscription.create(request.tenantId, request.plan, request.amount, request.currency || 'TRY');
        const savedSubscription = await this.subscriptionRepository.create(subscription);
        return {
            subscription: {
                id: savedSubscription.id,
                tenantId: savedSubscription.tenantId,
                plan: savedSubscription.plan,
                status: savedSubscription.status,
                amount: savedSubscription.amount,
                currency: savedSubscription.currency,
            },
        };
    }
};
exports.CreateSubscriptionUseCase = CreateSubscriptionUseCase;
exports.CreateSubscriptionUseCase = CreateSubscriptionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ISubscriptionRepository')),
    __param(1, (0, common_1.Inject)('ITenantRepository')),
    __metadata("design:paramtypes", [Object, Object])
], CreateSubscriptionUseCase);
//# sourceMappingURL=create-subscription.use-case.js.map