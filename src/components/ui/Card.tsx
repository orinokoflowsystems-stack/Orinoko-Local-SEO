import type { HTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900', className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 dark:border-slate-800', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-slate-950 dark:text-white', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-5 py-4', className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800', className)} {...props} />;
}

export function StatCard({ title, value, description, children }: PropsWithChildren<{ title: string; value: string; description?: string }>) {
  return (
    <Card>
      <CardBody className="space-y-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <div className="flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold text-slate-950 dark:text-white">{value}</p>
          {children}
        </div>
        {description ? <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p> : null}
      </CardBody>
    </Card>
  );
}

