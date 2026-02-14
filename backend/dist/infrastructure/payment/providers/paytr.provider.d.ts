import { ConfigService } from '@nestjs/config';
import { IPaymentProvider } from '../../../domain/payment/payment-provider.interface';
export declare class PayTrProvider implements IPaymentProvider {
    private readonly configService;
    readonly name = "paytr";
    private readonly logger;
    constructor(configService: ConfigService);
    createPaymentIntent(params: import('../../../domain/payment/payment-provider.interface').CreatePaymentIntentParams): Promise<import('../../../domain/payment/payment-provider.interface').PaymentIntentResult>;
    verifyWebhook(signature: string, payload: string): boolean;
    processWebhook(payload: any): Promise<import('../../../domain/payment/payment-provider.interface').WebhookResult>;
    refund(transactionId: string, amount?: number): Promise<import('../../../domain/payment/payment-provider.interface').RefundResult>;
}
