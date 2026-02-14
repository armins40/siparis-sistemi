import { Payment, PaymentStatus } from './payment.entity';
import { IBaseRepository } from '../shared/repository.interface';
export interface IPaymentRepository extends IBaseRepository<Payment> {
    findByPaymentIntentId(paymentIntentId: string): Promise<Payment | null>;
    findByProviderTransactionId(transactionId: string): Promise<Payment | null>;
    findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<Payment[]>;
    findByStatus(status: PaymentStatus): Promise<Payment[]>;
    findBySubscriptionId(subscriptionId: string): Promise<Payment[]>;
}
