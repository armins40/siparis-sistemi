import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderStatus } from '../../shared/constants';
export declare class OrderService {
    private orderRepository;
    constructor(orderRepository: Repository<Order>);
    create(tenantId: string, orderData: Partial<Order>): Promise<Order>;
    updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
    getOrdersByTenant(tenantId: string): Promise<Order[]>;
    getOrder(orderId: string): Promise<Order>;
    private generateOrderNumber;
}
