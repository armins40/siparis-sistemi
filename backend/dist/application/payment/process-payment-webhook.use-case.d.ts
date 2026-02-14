import { ICommand } from '../shared/use-case.interface';
import { IPaymentRepository } from '../../domain/payment/payment.repository.interface';
import { IPaymentProvider } from '../../domain/payment/payment-provider.interface';
import { IEventBus } from '../shared/event-bus.interface';
export interface ProcessPaymentWebhookRequest {
    provider: string;
    signature: string;
    payload: string;
}
export interface ProcessPaymentWebhookResponse {
    success: boolean;
    paymentId?: string;
    status?: string;
}
export declare class ProcessPaymentWebhookUseCase implements ICommand<ProcessPaymentWebhookRequest, ProcessPaymentWebhookResponse> {
    private readonly paymentRepository;
    private readonly paymentProvider;
    private readonly eventBus;
    constructor(paymentRepository: IPaymentRepository, paymentProvider: IPaymentProvider, eventBus: IEventBus);
    execute(request: ProcessPaymentWebhookRequest): Promise<ProcessPaymentWebhookResponse>;
}
