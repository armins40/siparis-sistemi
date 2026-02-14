import { ConfigService } from '@nestjs/config';
import { IPaymentProvider, PaymentRequest, PaymentResponse, PaymentVerificationRequest, PaymentVerificationResponse } from '../interfaces/payment-provider.interface';
export declare class PaytrProvider implements IPaymentProvider {
    private configService;
    private merchantId;
    private merchantKey;
    private merchantSalt;
    private baseUrl;
    constructor(configService: ConfigService);
    createPayment(request: PaymentRequest): Promise<PaymentResponse>;
    verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse>;
    handleWebhook(payload: any, signature?: string): Promise<PaymentVerificationResponse>;
    refund(paymentId: string, amount?: number): Promise<{
        success: boolean;
    }>;
}
