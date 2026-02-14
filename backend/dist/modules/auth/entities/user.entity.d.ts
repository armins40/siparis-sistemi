import { TenantBaseEntity } from '../../../shared/base/base.entity';
import { Tenant } from '../../tenant/entities/tenant.entity';
import { UserRole } from '../../../shared/constants';
export declare class User extends TenantBaseEntity {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    isEmailVerified: boolean;
    isActive: boolean;
    lastLoginAt?: Date;
    emailVerificationToken?: string;
    emailVerificationTokenExpires?: Date;
    passwordResetToken?: string;
    passwordResetTokenExpires?: Date;
    tenant: Tenant;
}
