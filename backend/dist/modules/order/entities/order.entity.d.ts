import { TenantBaseEntity } from '../../../shared/base/base.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { Customer } from '../../customer/entities/customer.entity';
import { OrderStatus } from '../../../shared/constants';
export declare class Order extends TenantBaseEntity {
    tenant: Tenant;
    customerId?: string;
    customer?: Customer;
    orderNumber: string;
    status: OrderStatus;
    items: any[];
    subtotal: number;
    taxAmount: number;
    deliveryFee: number;
    total: number;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    whatsappMessageId?: string;
    notes?: string;
    confirmedAt?: Date;
    deliveredAt?: Date;
    metadata?: Record<string, any>;
}
