import { TenantBaseEntity } from '../../../shared/base/base.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { PaymentStatus } from '../../../shared/constants';
export declare class Payment extends TenantBaseEntity {
    tenant: Tenant;
    provider: string;
    paymentProviderId: string;
    transactionId?: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
    description?: string;
    redirectUrl?: string;
    metadata?: Record<string, any>;
    providerResponse?: Record<string, any>;
    retryCount: number;
    completedAt?: Date;
    failedAt?: Date;
}
