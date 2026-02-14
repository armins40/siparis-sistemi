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
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("./entities/tenant.entity");
const constants_1 = require("../../shared/constants");
let TenantService = class TenantService {
    constructor(tenantRepository) {
        this.tenantRepository = tenantRepository;
    }
    async create(createTenantDto) {
        const baseSlug = this.generateSlug(createTenantDto.name);
        let slug = baseSlug;
        let counter = 1;
        while (await this.tenantRepository.findOne({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 7);
        const tenant = this.tenantRepository.create({
            ...createTenantDto,
            slug,
            subscriptionStatus: constants_1.SubscriptionStatus.TRIAL,
            trialEndsAt,
            isActive: true,
            settings: {},
        });
        return this.tenantRepository.save(tenant);
    }
    async findOne(id) {
        const tenant = await this.tenantRepository.findOne({
            where: { id },
            relations: ['users'],
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async findBySlug(slug) {
        const tenant = await this.tenantRepository.findOne({
            where: { slug },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async update(id, updateData) {
        const tenant = await this.findOne(id);
        Object.assign(tenant, updateData);
        return this.tenantRepository.save(tenant);
    }
    async updateSubscriptionStatus(id, status) {
        return this.update(id, { subscriptionStatus: status });
    }
    async deactivate(id) {
        return this.update(id, { isActive: false });
    }
    async activate(id) {
        return this.update(id, { isActive: true });
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    async checkTrialExpiration() {
        const expiredTrials = await this.tenantRepository
            .createQueryBuilder('tenant')
            .where('tenant.subscriptionStatus = :status', {
            status: constants_1.SubscriptionStatus.TRIAL,
        })
            .andWhere('tenant.trialEndsAt < :now', { now: new Date() })
            .getMany();
        for (const tenant of expiredTrials) {
            tenant.subscriptionStatus = constants_1.SubscriptionStatus.EXPIRED;
            await this.tenantRepository.save(tenant);
        }
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TenantService);
//# sourceMappingURL=tenant.service.js.map