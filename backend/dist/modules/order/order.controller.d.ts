import { OrderService } from './order.service';
import { OrderStatus } from '../../shared/constants';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    createOrder(tenantId: string, orderData: any): Promise<import("./entities/order.entity").Order>;
    getOrders(tenantId: string): Promise<import("./entities/order.entity").Order[]>;
    getOrder(id: string): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, status: OrderStatus): Promise<import("./entities/order.entity").Order>;
}
