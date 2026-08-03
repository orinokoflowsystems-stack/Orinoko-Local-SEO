import type { HTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

const config = {
  info: { icon: Info, classes: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100' },
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100' },
  warning: { icon: TriangleAlert, classes: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100' },
  error: { icon: AlertCircle, classes: 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-100' },
} as const;

export function Alert({ className, children, type = 'info', ...props }: HTMLAttributes<HTMLDivElement> & { type?: keyof typeof config }) {
  const Icon = config[type].icon;
  return (
    <div className={cn('flex gap-3 rounded-2xl border px-4 py-3 text-sm', config[type].classes, className)} {...props}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

