import { TenantBaseEntity } from '../../../shared/base/base.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { InvoiceType } from '../../../shared/constants';
export declare class Invoice extends TenantBaseEntity {
    tenant: Tenant;
    invoiceNumber: string;
    type: InvoiceType;
    customerName: string;
    customerTaxId?: string;
    customerAddress?: string;
    customerEmail: string;
    items: any[];
    subtotal: number;
    taxAmount: number;
    total: number;
    currency: string;
    dueDate?: Date;
    paidAt?: Date;
    isPaid: boolean;
    pdfUrl?: string;
    uuid?: string;
    provider?: string;
    providerResponse?: Record<string, any>;
    description?: string;
}
