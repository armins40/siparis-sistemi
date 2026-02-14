import { CustomerService } from './customer.service';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    getCustomers(tenantId: string): Promise<import("./entities/customer.entity").Customer[]>;
}
