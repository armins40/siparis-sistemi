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
export declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERING = "delivering",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    SUPPORT = "support",
    FINANCE = "finance",
    TECH_OPS = "tech_ops",
    MANAGER = "manager",
    STAFF = "staff",
    CUSTOMER = "customer"
}
export declare enum NotificationType {
    EMAIL = "email",
    SMS = "sms",
    WHATSAPP = "whatsapp",
    PUSH = "push"
}
export declare enum InvoiceType {
    SUBSCRIPTION = "subscription",
    ONE_TIME = "one_time"
}
