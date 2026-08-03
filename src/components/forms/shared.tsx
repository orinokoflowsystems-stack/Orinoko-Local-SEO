import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

export function FormSection({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      {title ? (
        <div>
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function FormActions({ submitting, onCancel }: { submitting?: boolean; onCancel?: () => void }) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      {onCancel ? (
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      ) : null}
      <Button type="submit" loading={submitting}>
        Save changes
      </Button>
    </div>
  );
}

