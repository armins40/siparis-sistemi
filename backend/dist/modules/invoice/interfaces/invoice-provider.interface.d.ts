import { InvoiceType } from '../../../shared/constants';
export interface InvoiceItem {
    name: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
}
export interface CreateInvoiceRequest {
    tenantId: string;
    customerName: string;
    customerTaxId?: string;
    customerAddress?: string;
    customerEmail: string;
    items: InvoiceItem[];
    invoiceType: InvoiceType;
    dueDate?: Date;
    description?: string;
}
export interface InvoiceResponse {
    success: boolean;
    invoiceId: string;
    invoiceNumber: string;
    pdfUrl?: string;
    uuid?: string;
    message?: string;
}
export interface IInvoiceProvider {
    createInvoice(request: CreateInvoiceRequest): Promise<InvoiceResponse>;
    getInvoice(invoiceId: string): Promise<any>;
    sendInvoice(invoiceId: string, email: string): Promise<{
        success: boolean;
    }>;
    generatePDF(invoiceId: string): Promise<Buffer>;
}
