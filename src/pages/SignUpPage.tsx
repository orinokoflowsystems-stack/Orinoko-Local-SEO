import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useAuth } from '@/hooks/useAuth';

const steps = ['Credentials', 'Personal info', 'Organization', 'Invite team'];

export function SignUpPage() {
  const { isAuthenticated, signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    organizationName: '',
    timezone: 'America/New_York',
    locale: 'en' as 'en' | 'es',
    invites: '',
  });

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(form.email && form.password.length >= 8);
      case 1:
        return Boolean(form.firstName && form.lastName);
      case 2:
        return Boolean(form.organizationName);
      default:
        return true;
    }
  }, [form, step]);

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    const success = await signUp({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      organizationName: form.organizationName,
      timezone: form.timezone,
      locale: form.locale,
    });
    setLoading(false);
    if (success) {
      navigate('/');
      return;
    }
    setError('Unable to create the account. Try another email or use the demo login.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Set up your ORINOKO workspace</h2>
        <p className="mt-2 text-sm text-slate-300">Four-step onboarding for the MVP organization flow.</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-4">
        {steps.map((label, index) => (
          <div key={label} className={`rounded-2xl border px-3 py-3 text-sm ${index === step ? 'border-accent-400 bg-accent-400/10 text-white' : 'border-white/10 text-slate-300'}`}>
            <span className="mr-2 text-xs uppercase tracking-[0.2em]">0{index + 1}</span>
            {label}
          </div>
        ))}
      </div>
      {error ? <Alert type="error">{error}</Alert> : null}
      <div className="space-y-4 rounded-2xl border border-white/10 p-4">
        {step == 0 ? (
          <>
            <FormField label="Email"><Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></FormField>
            <FormField label="Password"><Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} /></FormField>
          </>
        ) : null}
        {step == 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name"><Input value={form.firstName} onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))} /></FormField>
            <FormField label="Last name"><Input value={form.lastName} onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))} /></FormField>
            <FormField label="Phone"><Input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></FormField>
          </div>
        ) : null}
        {step == 2 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Organization name"><Input value={form.organizationName} onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))} /></FormField>
            <FormField label="Timezone"><Select value={form.timezone} onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}><option value="America/New_York">America/New_York</option><option value="America/Chicago">America/Chicago</option><option value="America/Denver">America/Denver</option><option value="America/Los_Angeles">America/Los_Angeles</option></Select></FormField>
            <FormField label="Language"><Select value={form.locale} onChange={(event) => setForm((current) => ({ ...current, locale: event.target.value as 'en' | 'es' }))}><option value="en">English</option><option value="es">Español</option></Select></FormField>
          </div>
        ) : null}
        {step == 3 ? (
          <FormField label="Invite teammates (optional)"><Textarea value={form.invites} onChange={(event) => setForm((current) => ({ ...current, invites: event.target.value }))} placeholder="Add one email per line for future invitations." /></FormField>
        ) : null}
      </div>
      <div className="flex justify-between gap-3">
        <Button variant="ghost" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Back</Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))} disabled={!canContinue}>Continue</Button>
        ) : (
          <Button onClick={() => void handleSubmit()} loading={loading}>Create workspace</Button>
        )}
      </div>
    </div>
  );
}

