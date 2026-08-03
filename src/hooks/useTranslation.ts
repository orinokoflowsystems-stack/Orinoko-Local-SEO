import { translate } from '@/i18n';
import { useTheme } from '@/context/ThemeContext';

export function useTranslation() {
  const { locale, timezone } = useTheme();

  return {
    locale,
    timezone,
    t: (key: string, values?: Record<string, string | number>) => translate(locale, key, values),
    formatCurrency: (amount: number, currency = 'USD') =>
      new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
        style: 'currency',
        currency,
      }).format(amount),
    formatDate: (date: string) =>
      new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
        dateStyle: 'medium',
        timeZone: timezone,
      }).format(new Date(date)),
    formatDateTime: (date: string) =>
      new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: timezone,
      }).format(new Date(date)),
  };
}

