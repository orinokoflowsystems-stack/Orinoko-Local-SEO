import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/pages/AuthPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { ConfirmEmailPage } from '@/pages/ConfirmEmailPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { CustomersListPage } from '@/pages/CustomersListPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EstimateDetailPage } from '@/pages/EstimateDetailPage';
import { EstimatesListPage } from '@/pages/EstimatesListPage';
import { InvoiceDetailPage } from '@/pages/InvoiceDetailPage';
import { InvoicesListPage } from '@/pages/InvoicesListPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { JobsListPage } from '@/pages/JobsListPage';
import { LeadDetailPage } from '@/pages/LeadDetailPage';
import { LeadsListPage } from '@/pages/LeadsListPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PasswordResetPage } from '@/pages/PasswordResetPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SignInPage } from '@/pages/SignInPage';
import { SignUpPage } from '@/pages/SignUpPage';
import { TechnicianDetailPage } from '@/pages/TechnicianDetailPage';
import { TechniciansListPage } from '@/pages/TechniciansListPage';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

function AuthRoute({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

function HomeRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return <Navigate replace to={isAuthenticated ? '/' : '/auth'} />;
}

export default function App() {
  return (
    <Routes>
      <Route path="auth" element={<AuthPage />} />
      <Route path="auth/sign-in" element={<AuthRoute><SignInPage /></AuthRoute>} />
      <Route path="auth/sign-up" element={<AuthRoute><SignUpPage /></AuthRoute>} />
      <Route path="auth/reset" element={<AuthRoute><PasswordResetPage /></AuthRoute>} />
      <Route path="auth/confirm" element={<AuthRoute><ConfirmEmailPage /></AuthRoute>} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate replace to="/" />} />
          <Route path="leads" element={<LeadsListPage />} />
          <Route path="leads/:leadId" element={<LeadDetailPage />} />
          <Route path="customers" element={<CustomersListPage />} />
          <Route path="customers/:customerId" element={<CustomerDetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="technicians" element={<TechniciansListPage />} />
          <Route path="technicians/:technicianId" element={<TechnicianDetailPage />} />
          <Route path="estimates" element={<EstimatesListPage />} />
          <Route path="estimates/:estimateId" element={<EstimateDetailPage />} />
          <Route path="jobs" element={<JobsListPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route path="invoices" element={<InvoicesListPage />} />
          <Route path="invoices/:invoiceId" element={<InvoiceDetailPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['owner', 'admin']} />}>
        <Route element={<AppShell />}>
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="home" element={<HomeRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
