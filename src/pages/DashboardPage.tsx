import { format } from 'date-fns';
import { ArrowRight, Building2, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const highlights = [
  {
    label: 'Organizations',
    value: 'Multi-tenant ready',
    icon: Building2,
  },
  {
    label: 'Pipeline',
    value: 'Leads → Estimates → Jobs',
    icon: FileText,
  },
  {
    label: 'Teams',
    value: 'Technician operations hub',
    icon: Users,
  },
];

export function DashboardPage() {
  useDocumentTitle('ORINOKO AppSaaS');

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <span className="inline-flex rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-100">
          Scaffold initialized • {format(new Date(), 'PPP')}
        </span>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Production-ready frontend foundation for ORINOKO.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Vite, React 18, TypeScript, Tailwind CSS, routing, and shared structure are prepared
            for rapid feature delivery across field service workflows.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
            <Icon className="h-5 w-5 text-accent-300" />
            <p className="mt-4 text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-base font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/70 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Integration placeholder</h3>
            <p className="mt-1 text-sm text-slate-300">
              Existing <code>src/google_api.py</code> was preserved for future service integration.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent-300 transition hover:text-accent-200"
          >
            Expand modules next
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
