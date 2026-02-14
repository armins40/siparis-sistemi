import { TenantService } from './tenant.service';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    getCurrentTenant(tenantId: string): Promise<import("./entities/tenant.entity").Tenant>;
    updateCurrentTenant(tenantId: string, updateData: Partial<any>): Promise<import("./entities/tenant.entity").Tenant>;
    getTenant(id: string): Promise<import("./entities/tenant.entity").Tenant>;
}
