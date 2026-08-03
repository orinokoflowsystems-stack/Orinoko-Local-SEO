import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const variants = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
} as const;

export function Badge({ className, children, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium', variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

