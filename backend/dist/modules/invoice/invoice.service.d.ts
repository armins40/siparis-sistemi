import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreateInvoiceRequest } from './interfaces/invoice-provider.interface';
export declare class InvoiceService {
    private invoiceRepository;
    private providers;
    constructor(invoiceRepository: Repository<Invoice>);
    createInvoice(request: CreateInvoiceRequest, provider?: string): Promise<Invoice>;
    private createInvoiceLocal;
    getInvoice(invoiceId: string, tenantId?: string): Promise<Invoice>;
    getInvoicesByTenant(tenantId: string): Promise<Invoice[]>;
    private generateInvoiceNumber;
}
