import { useMemo } from 'react';
import { useAuth } from './useAuth';

export function useUser() {
  const { user, organization } = useAuth();

  return useMemo(
    () => ({
      user,
      organization,
      role: user?.roleKey ?? null,
      permissions: user?.permissions ?? [],
      fullName: user ? `${user.firstName} ${user.lastName}` : '',
    }),
    [organization, user],
  );
}

