import { AggregateRoot } from '../shared/aggregate-root.interface';
export declare enum SubscriptionStatus {
    TRIAL = "trial",
    ACTIVE = "active",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
    SUSPENDED = "suspended"
}
export declare enum SubscriptionPlan {
    MONTHLY = "monthly",
    YEARLY = "yearly"
}
export declare class Subscription extends AggregateRoot {
    tenantId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startsAt: Date;
    endsAt: Date | null;
    cancelledAt: Date | null;
    autoRenew: boolean;
    amount: number;
    currency: string;
    paymentIntentId: string | null;
    static create(tenantId: string, plan: SubscriptionPlan, amount: number, currency?: string): Subscription;
    activate(endsAt: Date): void;
    cancel(): void;
    expire(): void;
    suspend(): void;
    isActive(): boolean;
    isExpired(): boolean;
    isTrial(): boolean;
    setPaymentIntentId(paymentIntentId: string): void;
    enableAutoRenew(): void;
    disableAutoRenew(): void;
    renew(endsAt: Date): void;
}
