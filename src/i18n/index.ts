import en from './en.json';
import es from './es.json';

export const dictionaries = { en, es } as const;
export type TranslationKey = keyof typeof en;

export function translate(locale: 'en' | 'es', key: string, values?: Record<string, string | number>) {
  const dictionary = dictionaries[locale] ?? dictionaries.en;
  let template = dictionary[key as TranslationKey] ?? dictionaries.en[key as TranslationKey] ?? key;

  if (!values) {
    return template;
  }

  Object.entries(values).forEach(([name, value]) => {
    template = template.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value));
  });

  return template;
}

