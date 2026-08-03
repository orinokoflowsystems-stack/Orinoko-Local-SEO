import type { PropsWithChildren } from 'react';

export function CardGrid({ children }: PropsWithChildren) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

