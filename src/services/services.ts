import { getTable } from './storage';
import { createCrudService } from './base';

const service = createCrudService('services', ['name', 'description', 'categoryName']);

export const serviceCatalogService = {
  ...service,
  async listCategories() {
    return getTable('serviceCategories');
  },
};

