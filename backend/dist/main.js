"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = require("helmet");
const compression = require('compression');
const app_module_1 = require("./app.module");
const common_2 = require("@nestjs/common");
const all_exceptions_filter_1 = require("./shared/filters/all-exceptions.filter");
const transform_interceptor_1 = require("./shared/interceptors/transform.interceptor");
async function bootstrap() {
    const logger = new common_2.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/favicon.ico', (_req, res) => res.status(204).end());
    app.use((0, helmet_1.default)());
    const compressionMiddleware = typeof compression === 'function' ? compression : compression.default;
    app.use(compressionMiddleware());
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    });
    const apiPrefix = process.env.API_PREFIX || 'api/v1';
    app.setGlobalPrefix(apiPrefix, {
        exclude: ['api/docs', 'api/docs-json'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Siparis-Sistemi API')
            .setDescription('Multi-tenant SaaS Order Management System API')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth', 'Authentication endpoints')
            .addTag('tenants', 'Tenant management')
            .addTag('subscriptions', 'Subscription management')
            .addTag('payments', 'Payment processing')
            .addTag('invoices', 'Invoice management')
            .addTag('orders', 'Order management')
            .addTag('customers', 'Customer management')
            .addTag('notifications', 'Notification services')
            .addTag('admin', 'Admin panel endpoints')
            .addTag('analytics', 'Analytics and reporting')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
    }
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map