import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../../../domain/invoice/invoice.entity';
import { IInvoiceRepository } from '../../../domain/invoice/invoice.repository.interface';
import { TypeOrmBaseRepository } from '../typeorm-base.repository';
export declare class InvoiceRepository extends TypeOrmBaseRepository<Invoice> implements IInvoiceRepository {
    constructor(repository: Repository<Invoice>);
    findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null>;
    findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<Invoice[]>;
    findByStatus(status: InvoiceStatus): Promise<Invoice[]>;
    findBySubscriptionId(subscriptionId: string): Promise<Invoice[]>;
    findByPaymentId(paymentId: string): Promise<Invoice | null>;
}
