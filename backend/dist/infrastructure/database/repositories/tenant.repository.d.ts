import { Repository } from 'typeorm';
import { Tenant } from '../../../domain/tenant/tenant.entity';
import { ITenantRepository } from '../../../domain/tenant/tenant.repository.interface';
import { TypeOrmBaseRepository } from '../typeorm-base.repository';
export declare class TenantRepository extends TypeOrmBaseRepository<Tenant> implements ITenantRepository {
    constructor(repository: Repository<Tenant>);
    findBySubdomain(subdomain: string): Promise<Tenant | null>;
    findByEmail(email: string): Promise<Tenant | null>;
    findActiveTenants(): Promise<Tenant[]>;
    findTrialTenants(): Promise<Tenant[]>;
    findExpiredTrials(): Promise<Tenant[]>;
    findExpiringTrials(daysBeforeExpiry: number): Promise<Tenant[]>;
}
