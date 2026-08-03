import { createCrudService } from './base';

const service = createCrudService('organizations', ['name', 'email', 'phone', 'slug']);

export const organizationsService = {
  ...service,
  async getProfile(organizationId: string) {
    return service.getById(organizationId);
  },
  async updateSettings(organizationId: string, payload: Parameters<typeof service.update>[1]) {
    return service.update(organizationId, payload);
  },
};

