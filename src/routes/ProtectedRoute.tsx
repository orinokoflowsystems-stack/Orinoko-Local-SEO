import { Navigate, Outlet } from 'react-router-dom';
import { LoadingIndicator } from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import type { RoleKey } from '@/types';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: RoleKey[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingIndicator label="Loading ORINOKO workspace..." />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/auth" />;
  }

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.roleKey))) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}

