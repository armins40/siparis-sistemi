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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tenant_entity_1 = require("../tenant/entities/tenant.entity");
const subscription_entity_1 = require("../subscription/entities/subscription.entity");
const payment_entity_1 = require("../payment/entities/payment.entity");
const order_entity_1 = require("../order/entities/order.entity");
const user_entity_1 = require("../auth/entities/user.entity");
const tenant_service_1 = require("../tenant/tenant.service");
const constants_1 = require("../../shared/constants");
let AdminService = class AdminService {
    constructor(tenantRepo, subscriptionRepo, paymentRepo, orderRepo, userRepo, tenantService) {
        this.tenantRepo = tenantRepo;
        this.subscriptionRepo = subscriptionRepo;
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.tenantService = tenantService;
    }
    async getDashboardStats() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const last30Days = new Date(now);
        last30Days.setDate(last30Days.getDate() - 30);
        const [totalTenants, activeSubscriptions, trialTenants, ordersToday, ordersMonthly, revenueMonthly, recentTenants, recentCancelledSubs,] = await Promise.all([
            this.tenantRepo.count(),
            this.subscriptionRepo.count({
                where: {
                    status: constants_1.SubscriptionStatus.ACTIVE,
                    endDate: (0, typeorm_2.MoreThan)(now),
                },
            }),
            this.tenantRepo.count({
                where: { subscriptionStatus: constants_1.SubscriptionStatus.TRIAL },
            }),
            this.orderRepo.count({
                where: { createdAt: (0, typeorm_2.MoreThan)(todayStart) },
            }),
            this.orderRepo.count({
                where: { createdAt: (0, typeorm_2.MoreThan)(monthStart) },
            }),
            this.paymentRepo
                .createQueryBuilder('p')
                .select('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'sum')
                .where('p.status = :status', { status: constants_1.PaymentStatus.COMPLETED })
                .andWhere('p.completedAt >= :monthStart', { monthStart })
                .getRawOne()
                .then((r) => Number(r?.sum ?? 0)),
            this.tenantRepo.find({
                order: { createdAt: 'DESC' },
                take: 10,
                select: ['id', 'name', 'slug', 'ownerEmail', 'subscriptionStatus', 'createdAt'],
            }),
            this.subscriptionRepo.find({
                where: { status: constants_1.SubscriptionStatus.CANCELLED },
                order: { cancelledAt: 'DESC' },
                take: 10,
                relations: ['tenant'],
            }),
        ]);
        const monthlyOrdersChart = await this.orderRepo
            .createQueryBuilder('o')
            .select("DATE_TRUNC('day', o.createdAt)", 'date')
            .addSelect('COUNT(*)', 'count')
            .where('o.createdAt >= :start', { start: last30Days })
            .groupBy("DATE_TRUNC('day', o.createdAt)")
            .orderBy('date', 'ASC')
            .getRawMany()
            .then((rows) => rows.map((r) => ({
            date: new Date(r.date).toISOString().slice(0, 10),
            count: Number(r.count),
        })));
        const monthlyRevenueChart = await this.paymentRepo
            .createQueryBuilder('p')
            .select("DATE_TRUNC('day', p.completedAt)", 'date')
            .addSelect('COALESCE(SUM(CAST(p.amount AS DECIMAL)), 0)', 'amount')
            .where('p.status = :status', { status: constants_1.PaymentStatus.COMPLETED })
            .andWhere('p.completedAt >= :start', { start: last30Days })
            .groupBy("DATE_TRUNC('day', p.completedAt)")
            .orderBy('date', 'ASC')
            .getRawMany()
            .then((rows) => rows.map((r) => ({
            date: new Date(r.date).toISOString().slice(0, 10),
            amount: Number(r.amount),
        })));
        return {
            totalTenants,
            activeSubscriptions,
            trialTenants,
            ordersToday,
            ordersMonthly,
            revenueMonthly,
            monthlyOrdersChart,
            monthlyRevenueChart,
            recentTenants,
            recentCancelledSubscriptions: recentCancelledSubs.map((s) => ({
                id: s.id,
                tenantId: s.tenantId,
                tenantName: s.tenant?.name ?? '-',
                plan: s.plan,
                cancelledAt: s.cancelledAt,
            })),
        };
    }
    async getTenants(query) {
        const page = Math.max(1, query.page ?? 1);
        const limit = Math.min(100, Math.max(1, query.limit ?? 20));
        const qb = this.tenantRepo
            .createQueryBuilder('t')
            .orderBy('t.createdAt', 'DESC');
        if (query.search?.trim()) {
            const term = `%${query.search.trim()}%`;
            qb.andWhere('(t.name ILIKE :term OR t.ownerEmail ILIKE :term OR t.slug ILIKE :term)', { term });
        }
        if (query.status === 'trial') {
            qb.andWhere('t.subscriptionStatus = :s', {
                s: constants_1.SubscriptionStatus.TRIAL,
            });
        }
        else if (query.status === 'active') {
            qb.andWhere('t.subscriptionStatus = :s', {
                s: constants_1.SubscriptionStatus.ACTIVE,
            });
        }
        else if (query.status === 'expired') {
            qb.andWhere('t.subscriptionStatus = :s', {
                s: constants_1.SubscriptionStatus.EXPIRED,
            });
        }
        else if (query.status === 'cancelled') {
            qb.andWhere('t.subscriptionStatus = :s', {
                s: constants_1.SubscriptionStatus.CANCELLED,
            });
        }
        else if (query.status === 'inactive') {
            qb.andWhere('t.isActive = :v', { v: false });
        }
        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getTenantById(id) {
        return this.tenantService.findOne(id);
    }
    async suspendTenant(id) {
        return this.tenantService.deactivate(id);
    }
    async activateTenant(id) {
        return this.tenantService.activate(id);
    }
    async getTenantStats(tenantId) {
        const [orderCount, subscription] = await Promise.all([
            this.orderRepo.count({ where: { tenantId } }),
            this.subscriptionRepo.findOne({
                where: { tenantId, status: constants_1.SubscriptionStatus.ACTIVE },
                order: { endDate: 'DESC' },
            }),
        ]);
        return { orderCount, subscription };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tenant_entity_1.Tenant)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        tenant_service_1.TenantService])
], AdminService);
//# sourceMappingURL=admin.service.js.map