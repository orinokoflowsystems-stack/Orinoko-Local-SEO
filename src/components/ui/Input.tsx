import type { InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-accent-400/50 dark:bg-slate-950 dark:text-white',
        error
          ? 'border-rose-500 focus:border-rose-500'
          : 'border-slate-300 focus:border-brand-500 dark:border-slate-700',
        className,
      )}
      {...props}
    />
  );
}

