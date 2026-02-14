import { ConfigService } from '@nestjs/config';
import { IInvoiceProvider } from '../../../domain/invoice/invoice-provider.interface';
export declare class EFaturaProvider implements IInvoiceProvider {
    private readonly configService;
    readonly name = "e-fatura";
    private readonly logger;
    constructor(configService: ConfigService);
    createInvoice(params: import('../../../domain/invoice/invoice-provider.interface').CreateInvoiceParams): Promise<import('../../../domain/invoice/invoice-provider.interface').CreateInvoiceResult>;
    sendInvoice(invoiceId: string, email: string): Promise<import('../../../domain/invoice/invoice-provider.interface').SendInvoiceResult>;
    getInvoicePdf(invoiceId: string): Promise<Buffer>;
    cancelInvoice(invoiceId: string): Promise<void>;
}
