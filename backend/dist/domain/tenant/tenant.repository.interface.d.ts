import { Tenant } from './tenant.entity';
import { IBaseRepository } from '../shared/repository.interface';
export interface ITenantRepository extends IBaseRepository<Tenant> {
    findBySubdomain(subdomain: string): Promise<Tenant | null>;
    findByEmail(email: string): Promise<Tenant | null>;
    findActiveTenants(): Promise<Tenant[]>;
    findTrialTenants(): Promise<Tenant[]>;
    findExpiredTrials(): Promise<Tenant[]>;
    findExpiringTrials(daysBeforeExpiry: number): Promise<Tenant[]>;
}
