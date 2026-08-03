import { demoDatabase } from '@/data/demo';
import type {
  AppDatabase,
  DatabaseTableName,
  DatabaseTables,
  PaginatedResponse,
  QueryFilters,
  QueryOptions,
  ServiceError,
} from '@/types';

const STORAGE_KEY = 'orinoko-appsaas-mvp-db';
const SESSION_KEY = 'orinoko-appsaas-session';

function hasWindow() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function getDatabase(): AppDatabase {
  if (!hasWindow()) {
    return clone(demoDatabase);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoDatabase));
    return clone(demoDatabase);
  }

  try {
    return JSON.parse(raw) as AppDatabase;
  } catch {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(demoDatabase));
    return clone(demoDatabase);
  }
}

export function setDatabase(database: AppDatabase) {
  if (!hasWindow()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
}

export function resetDatabase() {
  setDatabase(clone(demoDatabase));
}

export function getStoredSession() {
  if (!hasWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { accessToken: string; refreshToken: string; expiresAt: string; userId: string; organizationId: string };
  } catch {
    return null;
  }
}

export function setStoredSession(session: { accessToken: string; refreshToken: string; expiresAt: string; userId: string; organizationId: string } | null) {
  if (!hasWindow()) {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getTable<K extends DatabaseTableName>(table: K): DatabaseTables[K][] {
  return getDatabase()[table] as DatabaseTables[K][];
}

export function replaceTable<K extends DatabaseTableName>(table: K, rows: DatabaseTables[K][]) {
  const database = getDatabase();
  database[table] = rows as AppDatabase[K];
  setDatabase(database);
}

export function findById<K extends DatabaseTableName>(table: K, id: string) {
  return getTable(table).find((row) => row.id === id) ?? null;
}

function matchesFilter<T extends Record<string, unknown>>(row: T, filters?: QueryFilters<T>) {
  if (!filters) {
    return true;
  }

  return Object.entries(filters).every(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return true;
    }

    const current = row[key as keyof T];

    if (Array.isArray(value)) {
      return value.includes(current as never);
    }

    if (Array.isArray(current)) {
      return current.includes(value);
    }

    return current === value;
  });
}

function matchesSearch<T extends Record<string, unknown>>(row: T, search?: string, searchFields?: Array<keyof T>) {
  if (!search || !searchFields?.length) {
    return true;
  }

  const normalized = search.toLowerCase();
  return searchFields.some((field) => String(row[field] ?? '').toLowerCase().includes(normalized));
}

export function queryTable<K extends DatabaseTableName>(table: K, options: QueryOptions<DatabaseTables[K]> = {}): PaginatedResponse<DatabaseTables[K]> {
  const {
    filters,
    page = 1,
    pageSize = 10,
    search,
    searchFields,
    sortBy,
    sortDirection = 'desc',
  } = options;

  const filtered = getTable(table)
    .filter((row) => matchesFilter(row as unknown as Record<string, unknown>, filters as QueryFilters<Record<string, unknown>>))
    .filter((row) => matchesSearch(row as unknown as Record<string, unknown>, search, searchFields as Array<keyof Record<string, unknown>>));

  const sorted = [...filtered];
  if (sortBy) {
    sorted.sort((left, right) => {
      const leftValue = left[sortBy];
      const rightValue = right[sortBy];
      if (leftValue === rightValue) return 0;
      if (leftValue === undefined || leftValue === null) return 1;
      if (rightValue === undefined || rightValue === null) return -1;
      if (leftValue > rightValue) return sortDirection === 'asc' ? 1 : -1;
      return sortDirection === 'asc' ? -1 : 1;
    });
  }

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = sorted.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function upsertRow<K extends DatabaseTableName>(table: K, row: DatabaseTables[K]) {
  const rows = getTable(table);
  const index = rows.findIndex((item) => item.id === row.id);
  const nextRows = [...rows];
  if (index >= 0) {
    nextRows[index] = row;
  } else {
    nextRows.unshift(row);
  }
  replaceTable(table, nextRows);
  return row;
}

export function deleteRow<K extends DatabaseTableName>(table: K, id: string) {
  const rows = getTable(table);
  const nextRows = rows.filter((row) => row.id !== id);
  replaceTable(table, nextRows);
}

export function createServiceError(message: string, code = 'service_error', details?: string): ServiceError {
  return { message, code, details };
}

