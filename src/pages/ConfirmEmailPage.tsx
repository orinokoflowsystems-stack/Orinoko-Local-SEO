import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';

export function ConfirmEmailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Confirm your email</h2>
        <p className="mt-2 text-sm text-slate-300">In demo mode, email confirmation is skipped automatically after sign up.</p>
      </div>
      <Alert type="info">Production projects should connect Supabase Auth email confirmation templates.</Alert>
      <Link to="/auth/sign-in" className="text-sm text-slate-300 hover:text-white">Continue to sign in</Link>
    </div>
  );
}

