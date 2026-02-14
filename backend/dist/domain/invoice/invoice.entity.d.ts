import { AggregateRoot } from '../shared/aggregate-root.interface';
export declare enum InvoiceStatus {
    DRAFT = "draft",
    PENDING = "pending",
    SENT = "sent",
    PAID = "paid",
    CANCELLED = "cancelled"
}
export declare enum InvoiceType {
    SUBSCRIPTION = "subscription",
    ONE_TIME = "one_time",
    REFUND = "refund"
}
export declare class Invoice extends AggregateRoot {
    tenantId: string;
    subscriptionId: string | null;
    paymentId: string | null;
    invoiceNumber: string;
    type: InvoiceType;
    status: InvoiceStatus;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    items: InvoiceItem[];
    billingAddress: Record<string, any> | null;
    providerInvoiceId: string | null;
    provider: string | null;
    pdfUrl: string | null;
    issueDate: Date;
    dueDate: Date | null;
    sentAt: Date | null;
    paidAt: Date | null;
    static create(tenantId: string, invoiceNumber: string, type: InvoiceType, items: InvoiceItem[], taxRate?: number, subscriptionId?: string, paymentId?: string): Invoice;
    markAsSent(): void;
    markAsPaid(): void;
    cancel(): void;
    setProviderInvoiceId(providerInvoiceId: string, provider: string): void;
    setPdfUrl(url: string): void;
    setBillingAddress(address: Record<string, any>): void;
}
export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    taxRate?: number;
}
