import { BriefcaseBusiness, CalendarDays, FileText, Home, Receipt, Settings, Users, Wrench } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';

const items = [
  { to: '/', labelKey: 'nav.dashboard', icon: Home },
  { to: '/leads', labelKey: 'nav.leads', icon: BriefcaseBusiness },
  { to: '/customers', labelKey: 'nav.customers', icon: Users },
  { to: '/calendar', labelKey: 'nav.calendar', icon: CalendarDays },
  { to: '/technicians', labelKey: 'nav.technicians', icon: Wrench },
  { to: '/estimates', labelKey: 'nav.estimates', icon: FileText },
  { to: '/jobs', labelKey: 'nav.jobs', icon: BriefcaseBusiness },
  { to: '/invoices', labelKey: 'nav.invoices', icon: Receipt },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings },
];

export function SidebarNavigation() {
  const { t } = useTranslation();

  return (
    <nav className="space-y-1">
      {items.map(({ icon: Icon, labelKey, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
              isActive
                ? 'bg-brand-700 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
            )
          }
        >
          <Icon className="h-4 w-4" />
          {t(labelKey)}
        </NavLink>
      ))}
    </nav>
  );
}

