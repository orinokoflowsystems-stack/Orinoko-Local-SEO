export type Role = 'owner' | 'admin' | 'dispatcher' | 'technician' | 'accounting' | 'viewer';

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
}

export interface User extends AuditFields {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: Role;
  isActive: boolean;
}

export interface Organization extends AuditFields {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  locale: string;
  subscriptionPlan: 'starter' | 'growth' | 'enterprise';
  branding?: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
  };
}

export interface TenantScoped {
  organizationId: string;
}

export interface Lead extends AuditFields, TenantScoped {
  id: string;
  source: 'web' | 'referral' | 'phone' | 'ads' | 'partner';
  status: 'new' | 'qualified' | 'converted' | 'lost';
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  serviceAddress?: string;
  notes?: string;
  assignedToUserId?: string;
}

export interface Customer extends AuditFields, TenantScoped {
  id: string;
  displayName: string;
  billingEmail?: string;
  billingPhone?: string;
  primaryContactId?: string;
  serviceAddresses: string[];
  tags: string[];
}

export interface Technician extends AuditFields, TenantScoped {
  id: string;
  userId: string;
  skills: string[];
  territory?: string;
  availabilityStatus: 'available' | 'scheduled' | 'off-duty';
}

export interface EstimateLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Estimate extends AuditFields, TenantScoped {
  id: string;
  customerId: string;
  leadId?: string;
  status: 'draft' | 'sent' | 'approved' | 'declined';
  validUntil?: string;
  subtotal: number;
  tax: number;
  total: number;
  items: EstimateLineItem[];
}

export interface Job extends AuditFields, TenantScoped {
  id: string;
  customerId: string;
  estimateId?: string;
  technicianIds: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledStart?: string;
  scheduledEnd?: string;
  serviceAddress: string;
  summary: string;
}

export interface Invoice extends AuditFields, TenantScoped {
  id: string;
  customerId: string;
  jobId?: string;
  estimateId?: string;
  invoiceNumber: string;
  dueDate?: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'void';
  subtotal: number;
  tax: number;
  total: number;
  balanceDue: number;
}

export interface RolePermission {
  role: Role;
  permissions: string[];
}

export interface AccessPolicy {
  resource: 'organization' | 'lead' | 'customer' | 'technician' | 'estimate' | 'job' | 'invoice';
  allowedRoles: Role[];
}

export interface TenantMembership extends AuditFields {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  isDefault: boolean;
}

export interface TenantContext {
  currentOrganization: Organization | null;
  memberships: TenantMembership[];
  canSwitchOrganizations: boolean;
}
