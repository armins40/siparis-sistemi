import { InvoiceType } from '../../../shared/constants';
export declare class InvoiceItemDto {
    name: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
}
export declare class CreateInvoiceDto {
    customerName: string;
    customerTaxId?: string;
    customerAddress?: string;
    customerEmail: string;
    items: InvoiceItemDto[];
    invoiceType: InvoiceType;
    dueDate?: string;
    description?: string;
    provider?: string;
}
