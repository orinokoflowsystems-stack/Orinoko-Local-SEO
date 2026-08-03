import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authService, type SignInPayload, type SignUpPayload } from '@/services/auth';
import type { AuthState } from '@/types';

interface AuthContextValue extends AuthState {
  signIn: (payload: SignInPayload) => Promise<boolean>;
  signUp: (payload: SignUpPayload) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  refreshSession: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  organization: null,
  session: null,
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  useEffect(() => {
    authService.getAuthState().then(setState);
  }, []);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const response = await authService.signIn(payload);
    if (response.data) {
      setState(response.data);
      return true;
    }
    return false;
  }, []);

  const signUp = useCallback(async (payload: SignUpPayload) => {
    const response = await authService.signUp(payload);
    if (response.data) {
      setState(response.data);
      return true;
    }
    return false;
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setState({ ...initialState, isLoading: false });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const response = await authService.resetPassword(email);
    return {
      success: Boolean(response.data),
      message: response.data?.message ?? response.error?.message ?? 'Unable to reset password.',
    };
  }, []);

  const refreshSession = useCallback(async () => {
    const refreshed = await authService.refreshToken();
    if (refreshed.data) {
      setState(await authService.getAuthState());
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      resetPassword,
      refreshSession,
    }),
    [refreshSession, resetPassword, signIn, signOut, signUp, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider.');
  }
  return context;
}

