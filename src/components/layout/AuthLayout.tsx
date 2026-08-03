import type { PropsWithChildren } from 'react';

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.05fr]">
        <section className="rounded-3xl bg-brand-grid bg-grid p-8">
          <p className="text-xs uppercase tracking-[0.4em] text-accent-300">ORINOKO AppSaaS</p>
          <h1 className="mt-6 text-4xl font-semibold">Modern field service operations for glass, doors, and service teams.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
            Launch with lead pipeline management, scheduling, technician coordination, estimates, jobs, invoices, and demo-ready analytics.
          </p>
        </section>
        <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">{children}</section>
      </div>
    </main>
  );
}

