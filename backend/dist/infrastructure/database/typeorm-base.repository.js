"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmBaseRepository = void 0;
const typeorm_1 = require("typeorm");
class TypeOrmBaseRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async findById(id, tenantId) {
        return this.repository.findOne({
            where: { id, tenantId },
        });
    }
    async findAll(tenantId) {
        return this.repository.find({
            where: { tenantId },
        });
    }
    async create(entity) {
        const saved = await this.repository.save(entity);
        return saved;
    }
    async update(entity) {
        const updated = await this.repository.save(entity);
        return updated;
    }
    async delete(id, tenantId) {
        await this.repository.delete({ id, tenantId });
    }
    async softDelete(id, tenantId) {
        await this.repository.softDelete({ id, tenantId });
    }
    async exists(id, tenantId) {
        const count = await this.repository.count({
            where: { id, tenantId },
        });
        return count > 0;
    }
    async findByTenant(tenantId, limit, offset) {
        const queryBuilder = this.repository
            .createQueryBuilder()
            .where('tenantId = :tenantId', { tenantId });
        if (limit) {
            queryBuilder.limit(limit);
        }
        if (offset) {
            queryBuilder.offset(offset);
        }
        return queryBuilder.getMany();
    }
    async countByTenant(tenantId) {
        return this.repository.count({
            where: { tenantId },
        });
    }
    async findByIds(ids, tenantId) {
        if (ids.length === 0) {
            return [];
        }
        return this.repository.find({
            where: {
                id: (0, typeorm_1.In)(ids),
                tenantId,
            },
        });
    }
}
exports.TypeOrmBaseRepository = TypeOrmBaseRepository;
//# sourceMappingURL=typeorm-base.repository.js.map