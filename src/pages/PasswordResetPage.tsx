import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export function PasswordResetPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('owner@handyglassdoor.com');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await resetPassword(email);
    setMessage(result.message);
    setSuccess(result.success);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Reset password</h2>
        <p className="mt-2 text-sm text-slate-300">We'll send demo instructions to your inbox.</p>
      </div>
      {message ? <Alert type={success ? 'success' : 'error'}>{message}</Alert> : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField>
        <Button className="w-full justify-center" type="submit">Send reset instructions</Button>
      </form>
      <Link to="/auth/sign-in" className="text-sm text-slate-300 hover:text-white">Back to sign in</Link>
    </div>
  );
}

