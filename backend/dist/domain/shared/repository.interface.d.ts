import { BaseEntity } from './base.entity';
export interface IRepository<T extends BaseEntity> {
    findById(id: string, tenantId: string): Promise<T | null>;
    findAll(tenantId: string): Promise<T[]>;
    create(entity: T): Promise<T>;
    update(entity: T): Promise<T>;
    delete(id: string, tenantId: string): Promise<void>;
    softDelete(id: string, tenantId: string): Promise<void>;
    exists(id: string, tenantId: string): Promise<boolean>;
}
export interface IBaseRepository<T extends BaseEntity> extends IRepository<T> {
    findByTenant(tenantId: string, limit?: number, offset?: number): Promise<T[]>;
    countByTenant(tenantId: string): Promise<number>;
    findByIds(ids: string[], tenantId: string): Promise<T[]>;
}
