import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useAuthContext } from './AuthContext';

interface OrganizationContextValue {
  organizationId: string | null;
  organizationName: string;
  timezone: string;
  locale: 'en' | 'es';
  currency: string;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { organization } = useAuthContext();

  const value = useMemo(
    () => ({
      organizationId: organization?.id ?? null,
      organizationName: organization?.name ?? 'ORINOKO',
      timezone: organization?.timezone ?? 'America/New_York',
      locale: organization?.locale ?? 'en',
      currency: organization?.currency ?? 'USD',
    }),
    [organization],
  );

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider.');
  }
  return context;
}

