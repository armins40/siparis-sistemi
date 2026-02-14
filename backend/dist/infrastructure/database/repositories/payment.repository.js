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
exports.PaymentRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../../../domain/payment/payment.entity");
const typeorm_base_repository_1 = require("../typeorm-base.repository");
let PaymentRepository = class PaymentRepository extends typeorm_base_repository_1.TypeOrmBaseRepository {
    constructor(repository) {
        super(repository);
    }
    async findByPaymentIntentId(paymentIntentId) {
        return this.repository.findOne({ where: { paymentIntentId } });
    }
    async findByProviderTransactionId(transactionId) {
        return this.repository.findOne({ where: { providerTransactionId: transactionId } });
    }
    async findByTenantId(tenantId, limit, offset) {
        const queryBuilder = this.repository
            .createQueryBuilder('payment')
            .where('payment.tenantId = :tenantId', { tenantId })
            .orderBy('payment.createdAt', 'DESC');
        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }
        return queryBuilder.getMany();
    }
    async findByStatus(status) {
        return this.repository.find({ where: { status } });
    }
    async findBySubscriptionId(subscriptionId) {
        return this.repository.find({ where: { subscriptionId } });
    }
};
exports.PaymentRepository = PaymentRepository;
exports.PaymentRepository = PaymentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PaymentRepository);
//# sourceMappingURL=payment.repository.js.map