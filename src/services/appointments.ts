import type { Appointment, AppointmentFilters, PaginatedResponse } from '@/types';
import { createCrudService } from './base';
import { getTable } from './storage';

const service = createCrudService('appointments', ['customerName', 'technicianName', 'serviceName', 'status']);

export const appointmentsService = {
  ...service,
  async listAppointments(filters: AppointmentFilters = {}): Promise<PaginatedResponse<Appointment>> {
    return service.list({
      filters: { technicianId: filters.technicianId, status: filters.status },
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
      sortBy: 'scheduledStart',
      sortDirection: 'asc',
    });
  },
  async checkAvailability(technicianId: string, scheduledStart: string, scheduledEnd: string) {
    const hasConflict = getTable('appointments').some((appointment) => {
      if (appointment.technicianId !== technicianId) return false;
      return !(appointment.scheduledEnd <= scheduledStart || appointment.scheduledStart >= scheduledEnd);
    });
    return { technicianId, available: !hasConflict };
  },
};

