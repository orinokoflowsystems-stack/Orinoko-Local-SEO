import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SupportedLocale, ThemeMode, ThemeSettings } from '@/types';

interface ThemeContextValue extends ThemeSettings {
  setLocale: (locale: SupportedLocale) => void;
  setMode: (mode: ThemeMode) => void;
  setTimezone: (timezone: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useLocalStorage<ThemeSettings>('orinoko-theme', {
    mode: 'dark',
    locale: 'en',
    timezone: 'America/New_York',
  });

  useEffect(() => {
    document.documentElement.lang = settings.locale;
    document.documentElement.dataset.theme = settings.mode;
  }, [settings.locale, settings.mode]);

  const value = useMemo(
    () => ({
      ...settings,
      setLocale: (locale: SupportedLocale) => setSettings((current) => ({ ...current, locale })),
      setMode: (mode: ThemeMode) => setSettings((current) => ({ ...current, mode })),
      setTimezone: (timezone: string) => setSettings((current) => ({ ...current, timezone })),
    }),
    [settings, setSettings],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
}

