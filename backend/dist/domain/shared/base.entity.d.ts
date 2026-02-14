export declare abstract class BaseEntity {
    id: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    isDeleted(): boolean;
    softDelete(): void;
    restore(): void;
}
