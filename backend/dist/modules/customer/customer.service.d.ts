import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
export declare class CustomerService {
    private customerRepository;
    constructor(customerRepository: Repository<Customer>);
    createOrUpdate(tenantId: string, customerData: Partial<Customer>): Promise<Customer>;
    getCustomersByTenant(tenantId: string): Promise<Customer[]>;
}
