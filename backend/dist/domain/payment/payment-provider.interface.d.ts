export interface IPaymentProvider {
    readonly name: string;
    createPaymentIntent(params: CreatePaymentIntentParams): Promise<PaymentIntentResult>;
    verifyWebhook(signature: string, payload: string): boolean;
    processWebhook(payload: any): Promise<WebhookResult>;
    refund(transactionId: string, amount?: number): Promise<RefundResult>;
}
export interface CreatePaymentIntentParams {
    amount: number;
    currency: string;
    tenantId: string;
    metadata?: Record<string, any>;
    returnUrl?: string;
    cancelUrl?: string;
}
export interface PaymentIntentResult {
    paymentIntentId: string;
    clientSecret?: string;
    redirectUrl?: string;
    metadata?: Record<string, any>;
}
export interface WebhookResult {
    transactionId: string;
    paymentIntentId: string;
    status: 'completed' | 'failed' | 'pending';
    amount: number;
    metadata?: Record<string, any>;
}
export interface RefundResult {
    refundId: string;
    status: 'completed' | 'failed';
    amount: number;
}
