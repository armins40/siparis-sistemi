import { Queue } from 'bullmq';
export declare class NotificationService {
    private emailQueue?;
    private smsQueue?;
    private whatsappQueue?;
    constructor(emailQueue?: Queue, smsQueue?: Queue, whatsappQueue?: Queue);
    sendEmail(to: string, subject: string, body: string): Promise<void>;
    sendSMS(to: string, message: string): Promise<void>;
    sendWhatsApp(to: string, message: string): Promise<void>;
}
