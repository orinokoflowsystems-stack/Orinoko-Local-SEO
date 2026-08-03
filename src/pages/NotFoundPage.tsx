import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-900 p-8 text-center shadow-panel">
        <p className="text-sm uppercase tracking-[0.3em] text-accent-300">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          The requested route has not been scaffolded yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-accent-400 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-accent-300"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
