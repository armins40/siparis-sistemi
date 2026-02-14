import { InvoiceItem } from './invoice.entity';
export interface IInvoiceProvider {
    readonly name: string;
    createInvoice(params: CreateInvoiceParams): Promise<CreateInvoiceResult>;
    sendInvoice(invoiceId: string, email: string): Promise<SendInvoiceResult>;
    getInvoicePdf(invoiceId: string): Promise<Buffer>;
    cancelInvoice(invoiceId: string): Promise<void>;
}
export interface CreateInvoiceParams {
    invoiceNumber: string;
    tenantId: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    issueDate: Date;
    dueDate?: Date;
    billingAddress?: Record<string, any>;
    metadata?: Record<string, any>;
}
export interface CreateInvoiceResult {
    providerInvoiceId: string;
    invoiceNumber: string;
    pdfUrl?: string;
    metadata?: Record<string, any>;
}
export interface SendInvoiceResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
