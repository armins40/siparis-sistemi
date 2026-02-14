"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WhatsappProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
let WhatsappProcessor = WhatsappProcessor_1 = class WhatsappProcessor extends bullmq_1.WorkerHost {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger(WhatsappProcessor_1.name);
    }
    async process(job) {
        this.logger.log(`Processing WhatsApp job ${job.id}`);
        this.logger.log(`Sending WhatsApp to ${job.data.to}`);
    }
};
exports.WhatsappProcessor = WhatsappProcessor;
exports.WhatsappProcessor = WhatsappProcessor = WhatsappProcessor_1 = __decorate([
    (0, bullmq_1.Processor)('whatsapp')
], WhatsappProcessor);
//# sourceMappingURL=whatsapp.processor.js.map