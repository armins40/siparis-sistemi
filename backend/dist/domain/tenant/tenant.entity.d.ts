import { AggregateRoot } from '../shared/aggregate-root.interface';
export declare enum TenantStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    TRIAL = "trial"
}
export declare class Tenant extends AggregateRoot {
    name: string;
    subdomain: string;
    email: string;
    phone: string;
    status: TenantStatus;
    settings: Record<string, any>;
    planId: string | null;
    trialEndsAt: Date | null;
    subscriptionEndsAt: Date | null;
    static create(name: string, subdomain: string, email: string, phone?: string): Tenant;
    activate(): void;
    suspend(): void;
    deactivate(): void;
    isActive(): boolean;
    isTrial(): boolean;
    isTrialExpired(): boolean;
    updateSettings(settings: Record<string, any>): void;
    setPlan(planId: string): void;
    setSubscriptionEndsAt(date: Date): void;
}
