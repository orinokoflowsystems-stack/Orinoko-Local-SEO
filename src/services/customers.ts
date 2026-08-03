import type { Customer, CustomerFilters, PaginatedResponse } from '@/types';
import { createCrudService } from './base';

const service = createCrudService('customers', ['firstName', 'lastName', 'email', 'phone', 'companyName']);

export const customersService = {
  ...service,
  async listCustomers(filters: CustomerFilters = {}): Promise<PaginatedResponse<Customer>> {
    return service.list({
      filters: { type: filters.type },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      search: filters.query,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    });
  },
  async search(query: string) {
    return service.list({ search: query, pageSize: 50, sortBy: 'lastName', sortDirection: 'asc' });
  },
};

