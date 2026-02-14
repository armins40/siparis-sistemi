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
exports.ActivateSubscriptionUseCase = void 0;
const common_1 = require("@nestjs/common");
let ActivateSubscriptionUseCase = class ActivateSubscriptionUseCase {
    constructor(subscriptionRepository, tenantRepository) {
        this.subscriptionRepository = subscriptionRepository;
        this.tenantRepository = tenantRepository;
    }
    async execute(request) {
        const subscription = await this.subscriptionRepository.findById(request.subscriptionId, request.tenantId);
        if (!subscription) {
            throw new Error(`Subscription ${request.subscriptionId} not found`);
        }
        if (subscription.tenantId !== request.tenantId) {
            throw new Error('Subscription does not belong to this tenant');
        }
        subscription.activate(request.endsAt);
        const tenant = await this.tenantRepository.findById(request.tenantId, request.tenantId);
        if (tenant) {
            tenant.activate();
            tenant.setSubscriptionEndsAt(request.endsAt);
            await this.tenantRepository.update(tenant);
        }
        const updatedSubscription = await this.subscriptionRepository.update(subscription);
        return {
            subscription: {
                id: updatedSubscription.id,
                status: updatedSubscription.status,
                endsAt: updatedSubscription.endsAt,
            },
        };
    }
};
exports.ActivateSubscriptionUseCase = ActivateSubscriptionUseCase;
exports.ActivateSubscriptionUseCase = ActivateSubscriptionUseCase = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ISubscriptionRepository')),
    __param(1, (0, common_1.Inject)('ITenantRepository')),
    __metadata("design:paramtypes", [Object, Object])
], ActivateSubscriptionUseCase);
//# sourceMappingURL=activate-subscription.use-case.js.map