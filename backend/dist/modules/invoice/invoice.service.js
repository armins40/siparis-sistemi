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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entities/invoice.entity");
let InvoiceService = class InvoiceService {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
        this.providers = new Map();
    }
    async createInvoice(request, provider = 'earsiv') {
        const invoiceProvider = this.providers.get(provider);
        if (!invoiceProvider) {
            return this.createInvoiceLocal(request);
        }
        const providerResponse = await invoiceProvider.createInvoice(request);
        const subtotal = request.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const taxAmount = request.items.reduce((sum, item) => sum + (item.total - item.unitPrice * item.quantity), 0);
        const total = subtotal + taxAmount;
        const invoiceNumber = await this.generateInvoiceNumber(request.tenantId);
        const invoice = this.invoiceRepository.create({
            tenantId: request.tenantId,
            invoiceNumber,
            type: request.invoiceType,
            customerName: request.customerName,
            customerTaxId: request.customerTaxId,
            customerAddress: request.customerAddress,
            customerEmail: request.customerEmail,
            items: request.items,
            subtotal,
            taxAmount,
            total,
            currency: 'TL',
            dueDate: request.dueDate,
            description: request.description,
            provider,
            uuid: providerResponse.uuid,
            pdfUrl: providerResponse.pdfUrl,
            providerResponse: providerResponse,
        });
        return this.invoiceRepository.save(invoice);
    }
    async createInvoiceLocal(request) {
        const subtotal = request.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const taxAmount = request.items.reduce((sum, item) => sum + (item.total - item.unitPrice * item.quantity), 0);
        const total = subtotal + taxAmount;
        const invoiceNumber = await this.generateInvoiceNumber(request.tenantId);
        const invoice = this.invoiceRepository.create({
            tenantId: request.tenantId,
            invoiceNumber,
            type: request.invoiceType,
            customerName: request.customerName,
            customerTaxId: request.customerTaxId,
            customerAddress: request.customerAddress,
            customerEmail: request.customerEmail,
            items: request.items,
            subtotal,
            taxAmount,
            total,
            currency: 'TL',
            dueDate: request.dueDate,
            description: request.description,
        });
        return this.invoiceRepository.save(invoice);
    }
    async getInvoice(invoiceId, tenantId) {
        const where = { id: invoiceId };
        if (tenantId) {
            where.tenantId = tenantId;
        }
        const invoice = await this.invoiceRepository.findOne({ where });
        if (!invoice) {
            throw new common_1.NotFoundException('Invoice not found');
        }
        return invoice;
    }
    async getInvoicesByTenant(tenantId) {
        return this.invoiceRepository.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });
    }
    async generateInvoiceNumber(tenantId) {
        const year = new Date().getFullYear();
        const count = await this.invoiceRepository.count({
            where: { tenantId },
        });
        return `INV-${year}-${String(count + 1).padStart(6, '0')}`;
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map