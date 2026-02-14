"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EFaturaProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EFaturaProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EFaturaProvider = EFaturaProvider_1 = class EFaturaProvider {
    constructor(configService) {
        this.configService = configService;
        this.name = 'e-fatura';
        this.logger = new common_1.Logger(EFaturaProvider_1.name);
    }
    async createInvoice(params) {
        this.logger.debug('Creating e-Fatura invoice', {
            invoiceNumber: params.invoiceNumber,
            tenantId: params.tenantId,
        });
        const providerInvoiceId = `ef_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        return {
            providerInvoiceId,
            invoiceNumber: params.invoiceNumber,
            pdfUrl: `https://efatura.example.com/invoices/${providerInvoiceId}.pdf`,
            metadata: {
                provider: this.name,
                createdAt: new Date().toISOString(),
            },
        };
    }
    async sendInvoice(invoiceId, email) {
        this.logger.debug('Sending e-Fatura invoice', { invoiceId, email });
        return {
            success: true,
            messageId: `msg_${Date.now()}`,
        };
    }
    async getInvoicePdf(invoiceId) {
        this.logger.debug('Getting e-Fatura PDF', { invoiceId });
        return Buffer.from('Mock PDF content');
    }
    async cancelInvoice(invoiceId) {
        this.logger.debug('Cancelling e-Fatura invoice', { invoiceId });
    }
};
exports.EFaturaProvider = EFaturaProvider;
exports.EFaturaProvider = EFaturaProvider = EFaturaProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EFaturaProvider);
//# sourceMappingURL=e-fatura.provider.js.map