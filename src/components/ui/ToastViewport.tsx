import { X } from 'lucide-react';
import { useToastContext } from '@/context/ToastContext';
import { Badge } from './Badge';
import { Button } from './Button';

export function ToastViewport() {
  const { dismissToast, toasts } = useToastContext();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant={toast.type === 'error' ? 'danger' : toast.type === 'warning' ? 'warning' : toast.type === 'success' ? 'success' : 'info'}>
                {toast.type}
              </Badge>
              <p className="mt-2 font-medium text-slate-950 dark:text-white">{toast.title}</p>
              {toast.description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.description}</p> : null}
            </div>
            <Button variant="ghost" size="sm" onClick={() => dismissToast(toast.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

