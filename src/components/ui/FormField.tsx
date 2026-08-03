import type { PropsWithChildren, ReactNode } from 'react';
import { Label } from './Label';

interface FormFieldProps extends PropsWithChildren {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
}

export function FormField({ children, error, hint, htmlFor, label }: FormFieldProps) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}
      {!error && hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
    </div>
  );
}

