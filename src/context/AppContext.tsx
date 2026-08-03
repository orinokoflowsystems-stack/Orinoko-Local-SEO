import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { TenantContext } from '@/types';

interface AppContextValue {
  tenant: TenantContext;
  setTenant: (tenant: TenantContext) => void;
}

const defaultTenant: TenantContext = {
  currentOrganization: null,
  memberships: [],
  canSwitchOrganizations: false,
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantContext>(defaultTenant);

  const value = useMemo(
    () => ({
      tenant,
      setTenant,
    }),
    [tenant],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
}
