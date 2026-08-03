import type { Job, JobFilters, JobPhoto, JobStatus, PaginatedResponse } from '@/types';
import { createCrudService } from './base';

const service = createCrudService('jobs', ['jobNumber', 'customerName', 'summary', 'status']);

export const jobsService = {
  ...service,
  async listJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    return service.list({
      filters: { status: filters.status },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      search: filters.query,
      sortBy: 'scheduledStart',
      sortDirection: 'desc',
    });
  },
  async updateStatus(id: string, status: JobStatus) {
    return service.update(id, { status });
  },
  async assignTechnicians(id: string, technicianIds: string[], technicianNames: string[]) {
    return service.update(id, { technicianIds, technicianNames });
  },
  async addPhoto(id: string, photo: JobPhoto) {
    const job = await service.getById(id);
    return service.update(id, { photos: [...job.photos, photo] });
  },
};

