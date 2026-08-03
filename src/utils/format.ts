import { format, formatDistanceToNow } from 'date-fns';
import type { SupportedLocale } from '@/types';

export function formatCurrency(amount: number, currency = 'USD', locale: SupportedLocale = 'en') {
  return new Intl.NumberFormat(locale === 'es' ? 'es-US' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string, locale: SupportedLocale = 'en') {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    dateStyle: 'medium',
  }).format(new Date(date));
}

export function formatDateTime(date: string, locale: SupportedLocale = 'en') {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-US' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function formatRelative(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatShortDate(date: string) {
  return format(new Date(date), 'MMM d');
}

