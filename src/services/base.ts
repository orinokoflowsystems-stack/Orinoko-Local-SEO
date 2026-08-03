import type {
  DatabaseTableName,
  DatabaseTables,
  NewRecord,
  PaginatedResponse,
  QueryOptions,
  ServiceResponse,
} from '@/types';
import { supabase } from './supabase';

export async function unwrapResponse<T>(response: ServiceResponse<T>) {
  if (response.error || response.data === null) {
    throw new Error(response.error?.message ?? 'Service request failed.');
  }
  return response.data;
}

export function createCrudService<K extends DatabaseTableName>(table: K, searchFields: Array<keyof DatabaseTables[K]>) {
  return {
    async list(options: QueryOptions<DatabaseTables[K]> = {}): Promise<PaginatedResponse<DatabaseTables[K]>> {
      return unwrapResponse(await supabase.from(table).select({ ...options, searchFields }));
    },
    async getById(id: string): Promise<DatabaseTables[K]> {
      return unwrapResponse(await supabase.from(table).getById(id));
    },
    async create(payload: NewRecord<DatabaseTables[K]>): Promise<DatabaseTables[K]> {
      return unwrapResponse(await supabase.from(table).insert(payload));
    },
    async update(id: string, payload: Partial<DatabaseTables[K]>): Promise<DatabaseTables[K]> {
      return unwrapResponse(await supabase.from(table).update(id, payload));
    },
    async remove(id: string) {
      return unwrapResponse(await supabase.from(table).delete(id));
    },
  };
}

