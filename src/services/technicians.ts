import type { PaginatedResponse, Technician, TechnicianFilters, TechnicianStatus } from '@/types';
import { getTable } from './storage';
import { createCrudService } from './base';

const service = createCrudService('technicians', ['firstName', 'lastName', 'email', 'territory']);

export const techniciansService = {
  ...service,
  async listTechnicians(filters: TechnicianFilters = {}): Promise<PaginatedResponse<Technician>> {
    return service.list({
      filters: { status: filters.status },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      search: filters.query,
      sortBy: 'workloadPercent',
      sortDirection: 'desc',
    });
  },
  async updateAvailability(id: string, status: TechnicianStatus) {
    return service.update(id, { status, isAvailable: status !== 'off_duty' });
  },
  async getWorkload(id: string) {
    const appointments = getTable('appointments').filter((appointment) => appointment.technicianId === id).length;
    const jobs = getTable('jobs').filter((job) => job.technicianIds.includes(id)).length;
    return { appointments, jobs, activeAssignments: appointments + jobs };
  },
};

