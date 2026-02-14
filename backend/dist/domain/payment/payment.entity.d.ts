import { AggregateRoot } from '../shared/aggregate-root.interface';
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare enum PaymentMethod {
    CREDIT_CARD = "credit_card",
    DEBIT_CARD = "debit_card",
    BANK_TRANSFER = "bank_transfer"
}
export declare class Payment extends AggregateRoot {
    tenantId: string;
    subscriptionId: string | null;
    status: PaymentStatus;
    method: PaymentMethod;
    amount: number;
    currency: string;
    paymentIntentId: string;
    providerTransactionId: string | null;
    provider: string;
    metadata: Record<string, any> | null;
    failureReason: string | null;
    completedAt: Date | null;
    failedAt: Date | null;
    static create(tenantId: string, amount: number, currency: string, method: PaymentMethod, paymentIntentId: string, provider: string, subscriptionId?: string): Payment;
    markAsProcessing(): void;
    complete(providerTransactionId: string, metadata?: Record<string, any>): void;
    fail(reason: string): void;
    cancel(): void;
    refund(): void;
    isCompleted(): boolean;
    isFailed(): boolean;
    setProviderTransactionId(transactionId: string): void;
    updateMetadata(metadata: Record<string, any>): void;
}
