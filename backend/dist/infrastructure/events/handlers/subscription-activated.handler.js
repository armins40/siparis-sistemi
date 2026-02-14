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
var SubscriptionActivatedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionActivatedHandler = void 0;
const common_1 = require("@nestjs/common");
const invoice_repository_1 = require("../../database/repositories/invoice.repository");
const invoice_entity_1 = require("../../../domain/invoice/invoice.entity");
const uuid_1 = require("uuid");
let SubscriptionActivatedHandler = SubscriptionActivatedHandler_1 = class SubscriptionActivatedHandler {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
        this.logger = new common_1.Logger(SubscriptionActivatedHandler_1.name);
    }
    async handle(event) {
        this.logger.log(`Handling SubscriptionActivated event`, {
            subscriptionId: event.aggregateId,
            tenantId: event.payload.tenantId,
        });
        try {
            const invoiceNumber = `INV-${Date.now()}-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`;
            const items = [
                {
                    description: `Subscription - ${event.payload.plan}`,
                    quantity: 1,
                    unitPrice: 0,
                    amount: 0,
                },
            ];
            const invoice = invoice_entity_1.Invoice.create(event.payload.tenantId, invoiceNumber, invoice_entity_1.InvoiceType.SUBSCRIPTION, items, 0.20, event.payload.tenantId);
            await this.invoiceRepository.create(invoice);
            this.logger.log(`Invoice created successfully`, {
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
            });
        }
        catch (error) {
            this.logger.error('Error handling SubscriptionActivated event', error);
            throw error;
        }
    }
};
exports.SubscriptionActivatedHandler = SubscriptionActivatedHandler;
exports.SubscriptionActivatedHandler = SubscriptionActivatedHandler = SubscriptionActivatedHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [invoice_repository_1.InvoiceRepository])
], SubscriptionActivatedHandler);
//# sourceMappingURL=subscription-activated.handler.js.map