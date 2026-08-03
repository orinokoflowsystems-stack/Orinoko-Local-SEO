import type { ReactNode } from 'react';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Table, type TableColumn } from '@/components/ui/Table';

interface DataTableProps<T extends Record<string, unknown>> {
  title?: string;
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  search: string;
  onSearchChange: (value: string) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  actions?: ReactNode;
}

export function DataTable<T extends Record<string, unknown>>({
  actions,
  columns,
  data,
  onPageChange,
  onSearchChange,
  page = 1,
  rowKey,
  search,
  title,
  totalPages = 1,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {title ? <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input placeholder="Search..." value={search} onChange={(event) => onSearchChange(event.target.value)} className="sm:w-72" />
          {actions}
        </div>
      </div>
      <Table columns={columns} data={data} rowKey={rowKey} filterText={search} />
      {onPageChange ? <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} /> : null}
    </div>
  );
}

