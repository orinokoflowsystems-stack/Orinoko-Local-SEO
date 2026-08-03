import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
}

export function Tabs({ onChange, tabs, value }: TabsProps) {
  return (
    <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            'rounded-lg px-3 py-2 text-sm font-medium transition',
            value === tab.id
              ? 'bg-white text-brand-700 shadow-sm dark:bg-slate-950 dark:text-brand-300'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
          )}
          onClick={() => onChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

