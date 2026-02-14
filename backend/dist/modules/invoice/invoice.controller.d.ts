import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
export declare class InvoiceController {
    private readonly invoiceService;
    constructor(invoiceService: InvoiceService);
    createInvoice(tenantId: string, dto: CreateInvoiceDto): Promise<import("./entities/invoice.entity").Invoice>;
    getInvoices(tenantId: string): Promise<import("./entities/invoice.entity").Invoice[]>;
    getInvoice(tenantId: string, id: string): Promise<import("./entities/invoice.entity").Invoice>;
}
