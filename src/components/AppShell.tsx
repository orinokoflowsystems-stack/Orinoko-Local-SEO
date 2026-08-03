import { BellDot } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface RouteCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface AppShellProps {
  routeCards: RouteCard[];
}

export function AppShell({ routeCards }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="bg-brand-grid bg-grid">
        <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-shell items-center justify-between px-6 py-4 lg:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent-300">ORINOKO AppSaaS</p>
              <h1 className="text-xl font-semibold text-white">Field Service Management Platform</h1>
            </div>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              <BellDot className="h-4 w-4 text-accent-300" />
              Scaffold ready for product modules
            </div>
          </div>
        </header>

        <main className="mx-auto grid max-w-shell gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <section className="rounded-xl border border-white/10 bg-slate-900/85 p-6 shadow-panel">
            <Outlet />
          </section>

          <aside className="space-y-4">
            {routeCards.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-xl border border-white/10 bg-white/5 p-5 shadow-panel"
              >
                <Icon className="mb-4 h-6 w-6 text-accent-300" />
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </article>
            ))}
          </aside>
        </main>
      </div>
    </div>
  );
}
