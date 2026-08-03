import { Outlet } from 'react-router-dom';
import { AppHeader } from '@/components/ui/AppHeader';
import { SidebarNavigation } from '@/components/ui/SidebarNavigation';
import { ToastViewport } from '@/components/ui/ToastViewport';

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-accent-500">Field service</p>
            <h2 className="mt-2 text-2xl font-semibold text-brand-700 dark:text-brand-300">ORINOKO</h2>
          </div>
          <SidebarNavigation />
        </aside>
        <div className="flex min-h-screen flex-col">
          <AppHeader />
          <main className="flex-1 px-4 py-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
      <ToastViewport />
    </div>
  );
}

