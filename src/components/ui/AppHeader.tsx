import { Globe, LogOut, MoonStar, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from './Badge';
import { Button } from './Button';

export function AppHeader() {
  const { organization, signOut, user } = useAuth();
  const { locale, setLocale, setMode, mode } = useTheme();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 lg:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-accent-500">{organization?.name ?? 'ORINOKO'}</p>
        <h1 className="text-xl font-semibold text-slate-950 dark:text-white">{t('app.name')}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="info">{t('common.demoMode')}</Badge>
        <Button variant="ghost" size="sm" onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}>
          <Globe className="h-4 w-4" />
          {locale.toUpperCase()}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}>
          {mode === 'dark' ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <div className="relative">
          <button className="rounded-full border border-slate-200 px-3 py-2 text-sm dark:border-slate-800" onClick={() => setMenuOpen((current) => !current)} type="button">
            {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
          </button>
          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-medium text-slate-950 dark:text-white">{user?.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{user?.roleKey}</p>
              <Button className="mt-3 w-full justify-center" variant="ghost" onClick={() => void signOut()}>
                <LogOut className="h-4 w-4" />
                {t('auth.signOut')}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

