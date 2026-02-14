import { ICommand } from '../shared/use-case.interface';
import { PaymentMethod } from '../../domain/payment/payment.entity';
import { IPaymentRepository } from '../../domain/payment/payment.repository.interface';
import { IPaymentProvider } from '../../domain/payment/payment-provider.interface';
export interface CreatePaymentIntentRequest {
    tenantId: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    subscriptionId?: string;
    returnUrl?: string;
    cancelUrl?: string;
    metadata?: Record<string, any>;
}
export interface CreatePaymentIntentResponse {
    paymentIntent: {
        id: string;
        paymentIntentId: string;
        status: string;
        amount: number;
        currency: string;
        clientSecret?: string;
        redirectUrl?: string;
    };
}
export declare class CreatePaymentIntentUseCase implements ICommand<CreatePaymentIntentRequest, CreatePaymentIntentResponse> {
    private readonly paymentRepository;
    private readonly paymentProvider;
    constructor(paymentRepository: IPaymentRepository, paymentProvider: IPaymentProvider);
    execute(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse>;
}
