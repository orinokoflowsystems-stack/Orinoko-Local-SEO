import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[110px] w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-accent-400/50 dark:bg-slate-950 dark:text-white',
        error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700',
        className,
      )}
      {...props}
    />
  );
}

