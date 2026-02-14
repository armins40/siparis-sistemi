import { Repository } from 'typeorm';
import { BaseEntity } from '../../domain/shared/base.entity';
import { IBaseRepository } from '../../domain/shared/repository.interface';
export declare abstract class TypeOrmBaseRepository<T extends BaseEntity> implements IBaseRepository<T> {
    protected readonly repository: Repository<T>;
    constructor(repository: Repository<T>);
    findById(id: string, tenantId: string): Promise<T | null>;
    findAll(tenantId: string): Promise<T[]>;
    create(entity: T): Promise<T>;
    update(entity: T): Promise<T>;
    delete(id: string, tenantId: string): Promise<void>;
    softDelete(id: string, tenantId: string): Promise<void>;
    exists(id: string, tenantId: string): Promise<boolean>;
    findByTenant(tenantId: string, limit?: number, offset?: number): Promise<T[]>;
    countByTenant(tenantId: string): Promise<number>;
    findByIds(ids: string[], tenantId: string): Promise<T[]>;
}
