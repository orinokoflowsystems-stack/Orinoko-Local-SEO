import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export function SignInPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('owner@handyglassdoor.com');
  const [password, setPassword] = useState('Demo123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const success = await signIn({ email, password });
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Sign in failed. Use the demo credentials shown below.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-300">Demo credentials are prefilled for Handy Glass & Door LLC.</p>
      </div>
      {error ? <Alert type="error">{error}</Alert> : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField>
        <FormField label="Password"><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></FormField>
        <Button className="w-full justify-center" type="submit" loading={loading}>Sign in</Button>
      </form>
      <div className="space-y-2 rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
        <p><strong>Demo login:</strong> owner@handyglassdoor.com</p>
        <p><strong>Password:</strong> Demo123!</p>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-300">
        <Link to="/auth/reset" className="hover:text-white">Forgot password?</Link>
        <Link to="/auth/sign-up" className="hover:text-white">Create account</Link>
      </div>
    </div>
  );
}

