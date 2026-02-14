import { Invoice, InvoiceStatus } from './invoice.entity';
import { IBaseRepository } from '../shared/repository.interface';
export interface IInvoiceRepository extends IBaseRepository<Invoice> {
    findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
    findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<Invoice[]>;
    findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
    findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
    findByPaymentId(paymentId: string): Promise<Invoice | null>;
}
