import type { Lead, LeadFilters, LeadStatus, PaginatedResponse } from '@/types';
import { createCrudService } from './base';

const service = createCrudService('leads', ['firstName', 'lastName', 'email', 'phone', 'serviceRequested', 'sourceName']);

export const leadsService = {
  ...service,
  async listLeads(filters: LeadFilters = {}): Promise<PaginatedResponse<Lead>> {
    return service.list({
      filters: {
        status: filters.status,
        priority: filters.priority,
        assignedToUserId: filters.assignedToUserId,
      },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      search: filters.query,
      sortBy: 'updatedAt',
      sortDirection: 'desc',
    });
  },
  async updateStatus(id: string, status: LeadStatus) {
    return service.update(id, { status });
  },
  async assignLead(id: string, assignedToUserId: string, assignedToName: string) {
    return service.update(id, { assignedToUserId, assignedToName });
  },
  async listByStage() {
    const records = await service.list({ pageSize: 100, sortBy: 'pipelineStageName', sortDirection: 'asc' });
    return records.data.reduce<Record<string, Lead[]>>((groups, lead) => {
      groups[lead.pipelineStageName] = [...(groups[lead.pipelineStageName] ?? []), lead];
      return groups;
    }, {});
  },
};

