import { BaseEntity } from '../../../shared/base/base.entity';
import { User } from '../../auth/entities/user.entity';
import { SubscriptionStatus } from '../../../shared/constants';
export declare class Tenant extends BaseEntity {
    name: string;
    slug: string;
    ownerEmail: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
    taxOffice?: string;
    subscriptionStatus: SubscriptionStatus;
    trialEndsAt?: Date;
    isActive: boolean;
    settings?: Record<string, any>;
    users: User[];
}
