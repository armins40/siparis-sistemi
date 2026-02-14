import { ICommand } from '../shared/use-case.interface';
import { ITenantRepository } from '../../domain/tenant/tenant.repository.interface';
export interface CreateTenantRequest {
    name: string;
    subdomain: string;
    email: string;
    phone?: string;
}
export interface CreateTenantResponse {
    tenant: {
        id: string;
        name: string;
        subdomain: string;
        email: string;
        status: string;
        trialEndsAt: Date;
    };
}
export declare class CreateTenantUseCase implements ICommand<CreateTenantRequest, CreateTenantResponse> {
    private readonly tenantRepository;
    constructor(tenantRepository: ITenantRepository);
    execute(request: CreateTenantRequest): Promise<CreateTenantResponse>;
}
