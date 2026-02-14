import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../../../domain/payment/payment.entity';
import { IPaymentRepository } from '../../../domain/payment/payment.repository.interface';
import { TypeOrmBaseRepository } from '../typeorm-base.repository';
export declare class PaymentRepository extends TypeOrmBaseRepository<Payment> implements IPaymentRepository {
    constructor(repository: Repository<Payment>);
    findByPaymentIntentId(paymentIntentId: string): Promise<Payment | null>;
    findByProviderTransactionId(transactionId: string): Promise<Payment | null>;
    findByTenantId(tenantId: string, limit?: number, offset?: number): Promise<Payment[]>;
    findByStatus(status: PaymentStatus): Promise<Payment[]>;
    findBySubscriptionId(subscriptionId: string): Promise<Payment[]>;
}
