import type { Estimate, EstimateFilters, EstimateStatus, PaginatedResponse } from '@/types';
import { createCrudService } from './base';

const service = createCrudService('estimates', ['estimateNumber', 'customerName', 'scopeOfWork', 'status']);

export const estimatesService = {
  ...service,
  async listEstimates(filters: EstimateFilters = {}): Promise<PaginatedResponse<Estimate>> {
    return service.list({
      filters: { status: filters.status },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      search: filters.query,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    });
  },
  async updateStatus(id: string, status: EstimateStatus) {
    const patch: Partial<Estimate> = { status };
    if (status === 'sent') patch.sentAt = new Date().toISOString();
    if (status === 'approved') patch.approvedAt = new Date().toISOString();
    return service.update(id, patch);
  },
  async generatePdf(id: string) {
    const estimate = await service.getById(id);
    return { fileName: `${estimate.estimateNumber}.pdf`, url: '#' };
  },
};

