import type { Invoice, InvoiceFilters, InvoiceStatus, PaginatedResponse, Payment } from '@/types';
import { createCrudService } from './base';

const service = createCrudService('invoices', ['invoiceNumber', 'customerName', 'status']);

export const invoicesService = {
  ...service,
  async listInvoices(filters: InvoiceFilters = {}): Promise<PaginatedResponse<Invoice>> {
    return service.list({
      filters: { status: filters.status },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      search: filters.query,
      sortBy: 'dueDate',
      sortDirection: 'asc',
    });
  },
  async updateStatus(id: string, status: InvoiceStatus) {
    return service.update(id, { status });
  },
  async recordPayment(id: string, payment: Payment) {
    const invoice = await service.getById(id);
    const payments = [...invoice.payments, payment];
    const paidTotal = payments.reduce((total, entry) => total + entry.amount, 0);
    const balanceDue = Math.max(0, invoice.total - paidTotal);
    const status: InvoiceStatus = balanceDue === 0 ? 'paid' : paidTotal > 0 ? 'partial' : invoice.status;
    return service.update(id, { payments, balanceDue, status });
  },
};

