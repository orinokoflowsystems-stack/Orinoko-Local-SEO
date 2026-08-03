import { getTable } from './storage';
import { createCrudService } from './base';
import type { RoleKey } from '@/types';

const service = createCrudService('users', ['firstName', 'lastName', 'email', 'roleKey']);

export const usersService = {
  ...service,
  async listRoles() {
    return getTable('roles');
  },
  async updateRole(id: string, roleKey: RoleKey) {
    const role = getTable('roles').find((entry) => entry.key === roleKey);
    return service.update(id, {
      roleId: role?.id ?? '',
      roleKey,
      permissions: role?.permissionCodes ?? [],
    });
  },
};

