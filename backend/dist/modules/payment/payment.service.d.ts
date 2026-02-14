import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { PaymentRequest, PaymentResponse } from './interfaces/payment-provider.interface';
import { PaytrProvider } from './providers/paytr.provider';
export declare class PaymentService {
    private paymentRepository;
    private configService;
    private paytrProvider;
    private providers;
    constructor(paymentRepository: Repository<Payment>, configService: ConfigService, paytrProvider: PaytrProvider);
    createPayment(tenantId: string, request: PaymentRequest, provider?: string): Promise<PaymentResponse>;
    verifyPayment(paymentId: string, provider?: string): Promise<void>;
    handleWebhook(provider: string, payload: any, signature?: string): Promise<void>;
    getPayment(paymentId: string): Promise<Payment>;
    getPaymentsByTenant(tenantId: string): Promise<Payment[]>;
}
