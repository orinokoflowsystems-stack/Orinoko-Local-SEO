import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Spinner({ className }: { className?: string }) {
  return <LoaderCircle className={cn('h-5 w-5 animate-spin text-brand-700', className)} />;
}

export function LoadingIndicator({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <Spinner />
      {label}
    </div>
  );
}

