"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const notification_service_1 = require("./notification.service");
const email_processor_1 = require("./processors/email.processor");
const sms_processor_1 = require("./processors/sms.processor");
const whatsapp_processor_1 = require("./processors/whatsapp.processor");
const useRedis = !!(process.env.REDIS_HOST || process.env.NODE_ENV === 'production');
const queueImports = useRedis
    ? [
        bullmq_1.BullModule.registerQueue({ name: 'email' }),
        bullmq_1.BullModule.registerQueue({ name: 'sms' }),
        bullmq_1.BullModule.registerQueue({ name: 'whatsapp' }),
    ]
    : [];
const processors = useRedis
    ? [email_processor_1.EmailProcessor, sms_processor_1.SmsProcessor, whatsapp_processor_1.WhatsappProcessor]
    : [];
let NotificationModule = class NotificationModule {
};
exports.NotificationModule = NotificationModule;
exports.NotificationModule = NotificationModule = __decorate([
    (0, common_1.Module)({
        imports: queueImports,
        providers: [notification_service_1.NotificationService, ...processors],
        exports: [notification_service_1.NotificationService],
    })
], NotificationModule);
//# sourceMappingURL=notification.module.js.map