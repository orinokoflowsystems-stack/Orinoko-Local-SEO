import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {index > 0 ? <ChevronRight className="h-4 w-4" /> : null}
          {item.to ? <Link to={item.to} className="hover:text-brand-700 dark:hover:text-brand-300">{item.label}</Link> : <span className="text-slate-700 dark:text-slate-200">{item.label}</span>}
        </div>
      ))}
    </nav>
  );
}

