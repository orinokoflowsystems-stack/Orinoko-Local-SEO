import type { PropsWithChildren, ReactNode } from 'react';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';

export function DetailCard({ title, action, children }: PropsWithChildren<{ title: string; action?: ReactNode }>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );
}

export function KeyValueList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</dt>
          <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

