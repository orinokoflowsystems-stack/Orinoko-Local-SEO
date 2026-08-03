import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { OrganizationProvider } from './OrganizationContext';
import { ThemeProvider } from './ThemeContext';
import { ToastProvider } from './ToastContext';

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <OrganizationProvider>{children}</OrganizationProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

