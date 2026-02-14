import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { SubscriptionStatus } from '../../shared/constants';
export declare class TenantService {
    private tenantRepository;
    constructor(tenantRepository: Repository<Tenant>);
    create(createTenantDto: CreateTenantDto): Promise<Tenant>;
    findOne(id: string): Promise<Tenant>;
    findBySlug(slug: string): Promise<Tenant>;
    update(id: string, updateData: Partial<Tenant>): Promise<Tenant>;
    updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Tenant>;
    deactivate(id: string): Promise<Tenant>;
    activate(id: string): Promise<Tenant>;
    private generateSlug;
    checkTrialExpiration(): Promise<void>;
}
