import type {
  AuthSession,
  DatabaseTableName,
  DatabaseTables,
  NewRecord,
  QueryOptions,
  ServiceResponse,
} from '@/types';
import { createId } from '@/utils/id';
import {
  createServiceError,
  deleteRow,
  findById,
  getStoredSession,
  queryTable,
  setStoredSession,
  upsertRow,
} from './storage';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY && !SUPABASE_URL.includes('your-project-ref'));

async function safeJson<T>(response: Response) {
  const text = await response.text();
  if (!text) {
    return null as T | null;
  }
  return JSON.parse(text) as T;
}

async function request<T>(path: string, init: RequestInit): Promise<ServiceResponse<T>> {
  if (!isConfigured) {
    return { data: null, error: createServiceError('Supabase environment variables are not configured.', 'supabase_not_configured') };
  }

  try {
    const session = getStoredSession();
    const response = await fetch(`${SUPABASE_URL}${path}`, {
      ...init,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `****** ?? SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        data: null,
        error: createServiceError(`Supabase request failed with ${response.status}.`, 'supabase_request_failed', errorText),
      };
    }

    return { data: await safeJson<T>(response), error: null };
  } catch (error) {
    return {
      data: null,
      error: createServiceError(
        error instanceof Error ? error.message : 'Unexpected Supabase request error.',
        'supabase_request_failed',
      ),
    };
  }
}

class TableClient<K extends DatabaseTableName> {
  constructor(private readonly table: K) {}

  async select(options: QueryOptions<DatabaseTables[K]> = {}) {
    if (isConfigured) {
      const params = new URLSearchParams({ select: '*' });
      const network = await request<DatabaseTables[K][]>(`/rest/v1/${this.table}?${params.toString()}`, {
        method: 'GET',
      });
      if (!network.error && network.data) {
        const data = network.data;
        const page = options.page ?? 1;
        const pageSize = options.pageSize ?? data.length || 10;
        return {
          data: {
            data,
            total: data.length,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(data.length / pageSize)),
          },
          error: null,
        } as ServiceResponse<ReturnType<typeof queryTable<K>>>;
      }
    }

    try {
      return { data: queryTable(this.table, options), error: null } as ServiceResponse<ReturnType<typeof queryTable<K>>>;
    } catch (error) {
      return {
        data: null,
        error: createServiceError(error instanceof Error ? error.message : 'Unable to query records.'),
      };
    }
  }

  async getById(id: string): Promise<ServiceResponse<DatabaseTables[K]>> {
    if (isConfigured) {
      const network = await request<DatabaseTables[K][]>(`/rest/v1/${this.table}?id=eq.${id}&select=*`, {
        method: 'GET',
      });
      if (!network.error) {
        return { data: network.data?.[0] ?? null, error: null };
      }
    }

    const data = findById(this.table, id);
    return { data, error: data ? null : createServiceError('Record not found.', 'not_found') };
  }

  async insert(payload: NewRecord<DatabaseTables[K]>): Promise<ServiceResponse<DatabaseTables[K]>> {
    const record = {
      ...payload,
      id: payload.id ?? createId(this.table),
      createdAt: payload.createdAt ?? new Date().toISOString(),
      updatedAt: payload.updatedAt ?? new Date().toISOString(),
    } as DatabaseTables[K];

    if (isConfigured) {
      const network = await request<DatabaseTables[K][]>(`/rest/v1/${this.table}`, {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(record),
      });
      if (!network.error && network.data?.[0]) {
        return { data: network.data[0], error: null };
      }
    }

    return { data: upsertRow(this.table, record), error: null };
  }

  async update(id: string, updates: Partial<DatabaseTables[K]>): Promise<ServiceResponse<DatabaseTables[K]>> {
    const current = findById(this.table, id);
    if (!current) {
      return { data: null, error: createServiceError('Record not found.', 'not_found') };
    }

    const record = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    } as DatabaseTables[K];

    if (isConfigured) {
      const network = await request<DatabaseTables[K][]>(`/rest/v1/${this.table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(record),
      });
      if (!network.error && network.data?.[0]) {
        return { data: network.data[0], error: null };
      }
    }

    return { data: upsertRow(this.table, record), error: null };
  }

  async delete(id: string): Promise<ServiceResponse<{ id: string }>> {
    if (isConfigured) {
      const network = await request<DatabaseTables[K][]>(`/rest/v1/${this.table}?id=eq.${id}`, {
        method: 'DELETE',
      });
      if (!network.error) {
        return { data: { id }, error: null };
      }
    }

    deleteRow(this.table, id);
    return { data: { id }, error: null };
  }
}

const auth = {
  async getSession(): Promise<ServiceResponse<AuthSession>> {
    return { data: getStoredSession(), error: null };
  },
  async setSession(session: AuthSession | null) {
    setStoredSession(session);
    return { data: session, error: null } as ServiceResponse<AuthSession | null>;
  },
  async signOut() {
    setStoredSession(null);
    return { data: { success: true }, error: null };
  },
};

class SupabaseLikeClient {
  readonly isConfigured = isConfigured;
  readonly auth = auth;

  from<K extends DatabaseTableName>(table: K) {
    return new TableClient(table);
  }
}

export const supabase = new SupabaseLikeClient();
export { isConfigured as isSupabaseConfigured };

