import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TableColumn<T> {
  id: string;
  header: string;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  filterText?: string;
}

export function Table<T extends object>({ columns, data, filterText, rowKey }: TableProps<T>) {
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const filtered = useMemo(() => {
    const normalized = filterText?.toLowerCase().trim();
    const searched = !normalized
      ? data
      : data.filter((row) =>
          Object.values(row as Record<string, unknown>).some((value) => String(value ?? '').toLowerCase().includes(normalized)),
        );

    if (!sortBy) return searched;
    const column = columns.find((entry) => entry.id === sortBy);
    if (!column?.accessor) return searched;

    return [...searched].sort((left, right) => {
      const accessor = column.accessor as keyof T;
      const leftValue = left[accessor];
      const rightValue = right[accessor];
      if (leftValue === rightValue) return 0;
      if (leftValue === undefined || leftValue === null) return 1;
      if (rightValue === undefined || rightValue === null) return -1;
      if (leftValue > rightValue) return sortDirection === 'asc' ? 1 : -1;
      return sortDirection === 'asc' ? -1 : 1;
    });
  }, [columns, data, filterText, sortBy, sortDirection]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/50">
            <tr>
              {columns.map((column) => (
                <th key={column.id} className={cn('px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400', column.className)}>
                  {column.sortable && column.accessor ? (
                    <button
                      className="inline-flex items-center gap-2"
                      onClick={() => {
                        if (sortBy === column.id) {
                          setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
                        } else {
                          setSortBy(column.id);
                          setSortDirection('asc');
                        }
                      }}
                      type="button"
                    >
                      {column.header}
                      {sortBy === column.id && sortDirection === 'asc' ? <ArrowUpAZ className="h-4 w-4" /> : null}
                      {sortBy === column.id && sortDirection === 'desc' ? <ArrowDownAZ className="h-4 w-4" /> : null}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {filtered.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                {columns.map((column) => (
                  <td key={column.id} className={cn('px-4 py-3 align-top text-slate-700 dark:text-slate-200', column.className)}>
                    {column.cell ? column.cell(row) : column.accessor ? String((row as Record<string, unknown>)[String(column.accessor)] ?? '-') : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

