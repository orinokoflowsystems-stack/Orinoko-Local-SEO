import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 text-center backdrop-blur">
        <p className="text-sm uppercase tracking-[0.4em] text-accent-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold">Route not found</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">The page does not exist or your role cannot access it. Return to the operations dashboard.</p>
        <Button className="mt-6" asChild={false}><Link to="/">Go to dashboard</Link></Button>
      </div>
    </main>
  );
}

