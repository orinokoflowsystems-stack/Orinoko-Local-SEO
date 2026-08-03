import type { InputHTMLAttributes } from 'react';

export function Radio(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className="h-4 w-4 border-slate-300 text-brand-700 focus:ring-accent-400" {...props} />;
}

