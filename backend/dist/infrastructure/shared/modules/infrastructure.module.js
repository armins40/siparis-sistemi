"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const tenant_entity_1 = require("../../../domain/tenant/tenant.entity");
const subscription_entity_1 = require("../../../domain/subscription/subscription.entity");
const payment_entity_1 = require("../../../domain/payment/payment.entity");
const invoice_entity_1 = require("../../../domain/invoice/invoice.entity");
const tenant_repository_1 = require("../../database/repositories/tenant.repository");
const subscription_repository_1 = require("../../database/repositories/subscription.repository");
const payment_repository_1 = require("../../database/repositories/payment.repository");
const invoice_repository_1 = require("../../database/repositories/invoice.repository");
const event_bus_service_1 = require("../../events/event-bus.service");
const event_processor_1 = require("../../events/event.processor");
const payment_completed_handler_1 = require("../../events/handlers/payment-completed.handler");
const subscription_activated_handler_1 = require("../../events/handlers/subscription-activated.handler");
const paytr_provider_1 = require("../../payment/providers/paytr.provider");
const e_fatura_provider_1 = require("../../invoice/providers/e-fatura.provider");
let InfrastructureModule = class InfrastructureModule {
};
exports.InfrastructureModule = InfrastructureModule;
exports.InfrastructureModule = InfrastructureModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([tenant_entity_1.Tenant, subscription_entity_1.Subscription, payment_entity_1.Payment, invoice_entity_1.Invoice]),
            ...(process.env.REDIS_HOST || process.env.NODE_ENV === 'production'
                ? [
                    bullmq_1.BullModule.registerQueue({
                        name: 'events',
                    }),
                ]
                : []),
        ],
        providers: [
            {
                provide: 'ITenantRepository',
                useClass: tenant_repository_1.TenantRepository,
            },
            {
                provide: 'ISubscriptionRepository',
                useClass: subscription_repository_1.SubscriptionRepository,
            },
            {
                provide: 'IPaymentRepository',
                useClass: payment_repository_1.PaymentRepository,
            },
            {
                provide: 'IInvoiceRepository',
                useClass: invoice_repository_1.InvoiceRepository,
            },
            tenant_repository_1.TenantRepository,
            subscription_repository_1.SubscriptionRepository,
            payment_repository_1.PaymentRepository,
            invoice_repository_1.InvoiceRepository,
            event_bus_service_1.EventBusService,
            {
                provide: 'IEventBus',
                useClass: event_bus_service_1.EventBusService,
            },
            ...(process.env.REDIS_HOST || process.env.NODE_ENV === 'production'
                ? [event_processor_1.EventProcessor]
                : []),
            payment_completed_handler_1.PaymentCompletedHandler,
            subscription_activated_handler_1.SubscriptionActivatedHandler,
            paytr_provider_1.PayTrProvider,
            {
                provide: 'IPaymentProvider',
                useClass: paytr_provider_1.PayTrProvider,
            },
            e_fatura_provider_1.EFaturaProvider,
        ],
        exports: [
            {
                provide: 'ITenantRepository',
                useClass: tenant_repository_1.TenantRepository,
            },
            {
                provide: 'ISubscriptionRepository',
                useClass: subscription_repository_1.SubscriptionRepository,
            },
            {
                provide: 'IPaymentRepository',
                useClass: payment_repository_1.PaymentRepository,
            },
            {
                provide: 'IInvoiceRepository',
                useClass: invoice_repository_1.InvoiceRepository,
            },
            tenant_repository_1.TenantRepository,
            subscription_repository_1.SubscriptionRepository,
            payment_repository_1.PaymentRepository,
            invoice_repository_1.InvoiceRepository,
            event_bus_service_1.EventBusService,
            {
                provide: 'IEventBus',
                useClass: event_bus_service_1.EventBusService,
            },
            paytr_provider_1.PayTrProvider,
            {
                provide: 'IPaymentProvider',
                useClass: paytr_provider_1.PayTrProvider,
            },
            e_fatura_provider_1.EFaturaProvider,
        ],
    })
], InfrastructureModule);
//# sourceMappingURL=infrastructure.module.js.map