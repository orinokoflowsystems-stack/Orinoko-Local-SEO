import type { AuthSession, AuthState, NewRecord, Organization, ServiceResponse, User } from '@/types';
import { demoOrganization } from '@/data/demo';
import { createId, slugify } from '@/utils/id';
import { supabase } from './supabase';
import { createServiceError, getTable } from './storage';

const SESSION_TTL_HOURS = 8;

function createSession(user: User): AuthSession {
  return {
    accessToken: createId('token'),
    refreshToken: createId('refresh'),
    expiresAt: new Date(Date.now() + SESSION_TTL_HOURS * 3600000).toISOString(),
    userId: user.id,
    organizationId: user.organizationId,
  };
}

async function hydrateAuthState(session: AuthSession | null): Promise<AuthState> {
  if (!session) {
    return { isAuthenticated: false, isLoading: false, user: null, organization: null, session: null };
  }

  const userResponse = await supabase.from('users').getById(session.userId);
  const organizationResponse = await supabase.from('organizations').getById(session.organizationId);

  return {
    isAuthenticated: Boolean(userResponse.data && organizationResponse.data),
    isLoading: false,
    user: userResponse.data,
    organization: organizationResponse.data,
    session,
  };
}

export interface SignUpPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  organizationName: string;
  timezone: string;
  locale: 'en' | 'es';
}

export interface SignInPayload {
  email: string;
  password: string;
}

export const authService = {
  async signUp(payload: SignUpPayload): Promise<ServiceResponse<AuthState>> {
    const accountExists = getTable('authAccounts').some(
      (account) => account.email.toLowerCase() === payload.email.toLowerCase(),
    );

    if (accountExists) {
      return { data: null, error: createServiceError('An account with this email already exists.', 'email_exists') };
    }

    const organizationId = createId('org');
    const ownerRole = getTable('roles').find((role) => role.key === 'owner') ?? getTable('roles')[0];
    const organization: NewRecord<Organization> = {
      id: organizationId,
      name: payload.organizationName,
      slug: slugify(payload.organizationName),
      email: payload.email,
      phone: payload.phone ?? demoOrganization.phone,
      website: undefined,
      address: demoOrganization.address,
      timezone: payload.timezone,
      locale: payload.locale,
      currency: 'USD',
      branding: demoOrganization.branding,
      subscription: {
        plan: 'start',
        status: 'trialing',
        startsAt: new Date().toISOString(),
        renewsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        seats: 5,
      },
      createdBy: createId('bootstrap'),
    };

    const orgResponse = await supabase.from('organizations').insert(organization);
    if (orgResponse.error || !orgResponse.data) {
      return { data: null, error: orgResponse.error ?? createServiceError('Unable to create organization.') };
    }

    const userResponse = await supabase.from('users').insert({
      organizationId,
      roleId: ownerRole.id,
      roleKey: 'owner',
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      isActive: true,
      permissions: ownerRole.permissionCodes,
      createdBy: orgResponse.data.createdBy,
    });

    if (userResponse.error || !userResponse.data) {
      return { data: null, error: userResponse.error ?? createServiceError('Unable to create user.') };
    }

    await supabase.from('authAccounts').insert({
      organizationId,
      userId: userResponse.data.id,
      email: payload.email,
      password: payload.password,
      createdBy: userResponse.data.id,
    });

    const session = createSession(userResponse.data);
    await supabase.auth.setSession(session);
    return { data: await hydrateAuthState(session), error: null };
  },

  async signIn(payload: SignInPayload): Promise<ServiceResponse<AuthState>> {
    const account = getTable('authAccounts').find(
      (candidate) =>
        candidate.email.toLowerCase() === payload.email.toLowerCase() && candidate.password === payload.password,
    );

    if (!account) {
      return { data: null, error: createServiceError('Invalid email or password.', 'invalid_credentials') };
    }

    const userResponse = await supabase.from('users').getById(account.userId);
    if (userResponse.error || !userResponse.data) {
      return { data: null, error: createServiceError('User account could not be loaded.', 'user_not_found') };
    }

    const session = createSession(userResponse.data);
    await supabase.auth.setSession(session);
    return { data: await hydrateAuthState(session), error: null };
  },

  async signOut() {
    await supabase.auth.signOut();
    return { data: true, error: null };
  },

  async resetPassword(email: string): Promise<ServiceResponse<{ message: string }>> {
    const account = getTable('authAccounts').find((candidate) => candidate.email.toLowerCase() === email.toLowerCase());
    if (!account) {
      return { data: null, error: createServiceError('No account found with that email address.', 'account_missing') };
    }

    return {
      data: { message: 'Password reset instructions were sent in demo mode.' },
      error: null,
    };
  },

  async getCurrentUser(): Promise<ServiceResponse<User>> {
    const sessionResponse = await supabase.auth.getSession();
    if (!sessionResponse.data) {
      return { data: null, error: createServiceError('No active session.', 'not_authenticated') };
    }
    return supabase.from('users').getById(sessionResponse.data.userId);
  },

  async getAuthState(): Promise<AuthState> {
    const sessionResponse = await supabase.auth.getSession();
    return hydrateAuthState(sessionResponse.data);
  },

  async isAuthenticated() {
    const state = await this.getAuthState();
    return state.isAuthenticated;
  },

  async refreshToken(): Promise<ServiceResponse<AuthSession>> {
    const sessionResponse = await supabase.auth.getSession();
    if (!sessionResponse.data) {
      return { data: null, error: createServiceError('No active session.', 'not_authenticated') };
    }

    const userResponse = await supabase.from('users').getById(sessionResponse.data.userId);
    if (!userResponse.data) {
      return { data: null, error: createServiceError('Unable to refresh the current session.', 'user_not_found') };
    }

    const session = createSession(userResponse.data);
    await supabase.auth.setSession(session);
    return { data: session, error: null };
  },
};

