import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition focus:ring-2 focus:ring-accent-400/50 dark:bg-slate-950 dark:text-white',
        error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

