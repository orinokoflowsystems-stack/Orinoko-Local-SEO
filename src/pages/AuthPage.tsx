import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Tabs } from '@/components/ui/Tabs';
import { useAuth } from '@/hooks/useAuth';
import { SignInPage } from './SignInPage';
import { SignUpPage } from './SignUpPage';

export function AuthPage() {
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('sign-in');

  if (isAuthenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <Tabs
          tabs={[
            { id: 'sign-in', label: 'Sign in' },
            { id: 'sign-up', label: 'Create account' },
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'sign-in' ? <SignInPage /> : <SignUpPage />}
        <div className="text-sm text-slate-300">
          Need password help? <Link to="/auth/reset" className="text-white">Reset here</Link>
        </div>
      </div>
    </AuthLayout>
  );
}

