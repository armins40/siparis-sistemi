import { PaymentStatus } from '../../../shared/constants';
export interface PaymentRequest {
    amount: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface PaymentResponse {
    success: boolean;
    paymentId: string;
    redirectUrl?: string;
    status: PaymentStatus;
    message?: string;
    metadata?: Record<string, any>;
}
export interface PaymentVerificationRequest {
    paymentId: string;
    transactionId?: string;
}
export interface PaymentVerificationResponse {
    success: boolean;
    status: PaymentStatus;
    amount: number;
    currency: string;
    transactionId?: string;
    metadata?: Record<string, any>;
}
export interface IPaymentProvider {
    createPayment(request: PaymentRequest): Promise<PaymentResponse>;
    verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse>;
    handleWebhook(payload: any, signature?: string): Promise<PaymentVerificationResponse>;
    refund(paymentId: string, amount?: number): Promise<{
        success: boolean;
    }>;
}
