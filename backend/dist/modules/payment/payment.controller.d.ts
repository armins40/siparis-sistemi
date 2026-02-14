import { PaymentService } from './payment.service';
import { PaymentRequest } from './interfaces/payment-provider.interface';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createPayment(tenantId: string, request: PaymentRequest, provider?: string): Promise<import("./interfaces/payment-provider.interface").PaymentResponse>;
    getPayments(tenantId: string): Promise<import("./entities/payment.entity").Payment[]>;
    getPayment(id: string): Promise<import("./entities/payment.entity").Payment>;
    handleWebhook(provider: string, payload: any, signature?: string): Promise<{
        success: boolean;
    }>;
}
