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
var Invoice_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = exports.InvoiceType = exports.InvoiceStatus = void 0;
const typeorm_1 = require("typeorm");
const aggregate_root_interface_1 = require("../shared/aggregate-root.interface");
const invoice_events_1 = require("./invoice.events");
var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["PENDING"] = "pending";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (exports.InvoiceStatus = InvoiceStatus = {}));
var InvoiceType;
(function (InvoiceType) {
    InvoiceType["SUBSCRIPTION"] = "subscription";
    InvoiceType["ONE_TIME"] = "one_time";
    InvoiceType["REFUND"] = "refund";
})(InvoiceType || (exports.InvoiceType = InvoiceType = {}));
let Invoice = Invoice_1 = class Invoice extends aggregate_root_interface_1.AggregateRoot {
    static create(tenantId, invoiceNumber, type, items, taxRate = 0.20, subscriptionId, paymentId) {
        const invoice = new Invoice_1();
        invoice.id = undefined;
        invoice.tenantId = tenantId;
        invoice.subscriptionId = subscriptionId || null;
        invoice.paymentId = paymentId || null;
        invoice.invoiceNumber = invoiceNumber;
        invoice.type = type;
        invoice.status = InvoiceStatus.DRAFT;
        invoice.items = items;
        invoice.billingAddress = null;
        invoice.providerInvoiceId = null;
        invoice.provider = null;
        invoice.pdfUrl = null;
        invoice.issueDate = new Date();
        invoice.dueDate = null;
        invoice.sentAt = null;
        invoice.paidAt = null;
        invoice.subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        invoice.tax = invoice.subtotal * taxRate;
        invoice.total = invoice.subtotal + invoice.tax;
        invoice.currency = 'TRY';
        invoice.addDomainEvent(new invoice_events_1.InvoiceCreatedEvent(invoice.id, {
            tenantId: invoice.tenantId,
            invoiceNumber: invoice.invoiceNumber,
            total: invoice.total,
        }));
        return invoice;
    }
    markAsSent() {
        if (this.status === InvoiceStatus.SENT) {
            return;
        }
        this.status = InvoiceStatus.SENT;
        this.sentAt = new Date();
        this.addDomainEvent(new invoice_events_1.InvoiceSentEvent(this.id, {
            tenantId: this.tenantId,
            invoiceNumber: this.invoiceNumber,
            sentAt: this.sentAt.toISOString(),
        }));
    }
    markAsPaid() {
        this.status = InvoiceStatus.PAID;
        this.paidAt = new Date();
    }
    cancel() {
        if (this.status === InvoiceStatus.PAID) {
            throw new Error('Paid invoices cannot be cancelled');
        }
        this.status = InvoiceStatus.CANCELLED;
    }
    setProviderInvoiceId(providerInvoiceId, provider) {
        this.providerInvoiceId = providerInvoiceId;
        this.provider = provider;
    }
    setPdfUrl(url) {
        this.pdfUrl = url;
    }
    setBillingAddress(address) {
        this.billingAddress = address;
    }
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Invoice.prototype, "tenantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Invoice.prototype, "invoiceNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InvoiceType }),
    __metadata("design:type", String)
], Invoice.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT }),
    __metadata("design:type", String)
], Invoice.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "tax", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Invoice.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'TRY' }),
    __metadata("design:type", String)
], Invoice.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], Invoice.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Invoice.prototype, "billingAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "providerInvoiceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "pdfUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Invoice.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "sentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "paidAt", void 0);
exports.Invoice = Invoice = Invoice_1 = __decorate([
    (0, typeorm_1.Entity)('invoices'),
    (0, typeorm_1.Index)(['tenantId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['invoiceNumber'], { unique: true })
], Invoice);
//# sourceMappingURL=invoice.entity.js.map