"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bullmq_1 = require("@nestjs/bullmq");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
const database_config_1 = require("./infrastructure/database/database.config");
const infrastructure_module_1 = require("./infrastructure/shared/modules/infrastructure.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenant_module_1 = require("./modules/tenant/tenant.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const payment_module_1 = require("./modules/payment/payment.module");
const invoice_module_1 = require("./modules/invoice/invoice.module");
const order_module_1 = require("./modules/order/order.module");
const customer_module_1 = require("./modules/customer/customer.module");
const notification_module_1 = require("./modules/notification/notification.module");
const admin_module_1 = require("./modules/admin/admin.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const shared_module_1 = require("./shared/shared.module");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useClass: database_config_1.DatabaseConfig,
            }),
            nest_winston_1.WinstonModule.forRoot({
                transports: [
                    new winston.transports.Console({
                        format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, context }) => {
                            return `${timestamp} [${context}] ${level}: ${message}`;
                        })),
                    }),
                    new winston.transports.File({
                        filename: 'logs/error.log',
                        level: 'error',
                        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                    }),
                    new winston.transports.File({
                        filename: 'logs/combined.log',
                        format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                    }),
                ],
            }),
            ...(process.env.REDIS_HOST || process.env.NODE_ENV === 'production'
                ? [
                    bullmq_1.BullModule.forRoot({
                        connection: {
                            host: process.env.REDIS_HOST || 'localhost',
                            port: parseInt(process.env.REDIS_PORT || '6379'),
                            password: process.env.REDIS_PASSWORD || undefined,
                            maxRetriesPerRequest: null,
                            retryStrategy: (times) => {
                                if (times > 3) {
                                    return null;
                                }
                                return Math.min(times * 50, 2000);
                            },
                        },
                    }),
                ]
                : []),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            infrastructure_module_1.InfrastructureModule,
            shared_module_1.SharedModule,
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            subscription_module_1.SubscriptionModule,
            payment_module_1.PaymentModule,
            invoice_module_1.InvoiceModule,
            order_module_1.OrderModule,
            customer_module_1.CustomerModule,
            notification_module_1.NotificationModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map