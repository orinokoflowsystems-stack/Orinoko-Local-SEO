export type RoleKey =
  | 'owner'
  | 'admin'
  | 'dispatcher'
  | 'technician'
  | 'accounting'
  | 'viewer';

export type PermissionCode =
  | 'dashboard.view'
  | 'leads.view'
  | 'leads.manage'
  | 'customers.view'
  | 'customers.manage'
  | 'calendar.view'
  | 'calendar.manage'
  | 'technicians.view'
  | 'technicians.manage'
  | 'estimates.view'
  | 'estimates.manage'
  | 'jobs.view'
  | 'jobs.manage'
  | 'invoices.view'
  | 'invoices.manage'
  | 'settings.view'
  | 'settings.manage';

export type SubscriptionPlan = 'start' | 'grow' | 'scale';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent';
export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'appointment_scheduled'
  | 'estimate_sent'
  | 'estimate_approved'
  | 'job_scheduled'
  | 'in_progress'
  | 'completed'
  | 'payment_pending'
  | 'closed'
  | 'lost';
export type CustomerType = 'residential' | 'commercial';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';
export type TechnicianStatus = 'available' | 'scheduled' | 'on_job' | 'off_duty';
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'declined' | 'expired';
export type JobStatus = 'draft' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'canceled';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'partial' | 'overdue' | 'void';
export type PaymentMethod = 'cash' | 'card' | 'ach' | 'check' | 'other';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type ReviewRating = 1 | 2 | 3 | 4 | 5;
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type MessageChannel = 'internal' | 'sms' | 'email' | 'web';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error';
export type AutomationTrigger = 'lead_created' | 'estimate_sent' | 'job_completed' | 'invoice_overdue';
export type ThemeMode = 'light' | 'dark';
export type SupportedLocale = 'en' | 'es';
export type SortDirection = 'asc' | 'desc';

export interface AuditFields {
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DemoFields {
  isDemo?: boolean;
}

export interface TenantScoped {
  organizationId: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface OrganizationBranding {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
}

export interface SubscriptionDetails {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startsAt: string;
  endsAt?: string;
  renewsAt?: string;
  seats: number;
}

export interface Organization extends AuditFields, DemoFields {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  website?: string;
  address: Address;
  timezone: string;
  locale: SupportedLocale;
  currency: string;
  branding: OrganizationBranding;
  subscription: SubscriptionDetails;
}

export interface Permission extends AuditFields {
  id: string;
  code: PermissionCode;
  name: string;
  description: string;
  module: string;
}

export interface Role extends AuditFields, TenantScoped {
  id: string;
  key: RoleKey;
  name: string;
  description: string;
  permissionCodes: PermissionCode[];
  isSystemRole: boolean;
}

export interface User extends AuditFields, TenantScoped, DemoFields {
  id: string;
  roleId: string;
  roleKey: RoleKey;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  permissions: PermissionCode[];
}

export interface UserInvite extends AuditFields, TenantScoped {
  id: string;
  email: string;
  roleKey: RoleKey;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: string;
}

export interface LeadSource extends AuditFields, TenantScoped {
  id: string;
  name: string;
  description?: string;
}

export interface PipelineStage extends AuditFields, TenantScoped {
  id: string;
  name: string;
  order: number;
  color: string;
  description?: string;
  isSystem: boolean;
}

export interface Lead extends AuditFields, TenantScoped, DemoFields {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address: Address;
  sourceId: string;
  sourceName: string;
  pipelineStageId: string;
  pipelineStageName: string;
  status: LeadStatus;
  priority: LeadPriority;
  serviceRequested: string;
  notes?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  estimatedValue?: number;
  tags: string[];
  lastContactedAt?: string;
  nextFollowUpAt?: string;
}

export interface Customer extends AuditFields, TenantScoped, DemoFields {
  id: string;
  leadId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address: Address;
  type: CustomerType;
  preferredContact: 'phone' | 'email' | 'sms';
  totalSpent: number;
  jobsCompleted: number;
  notes?: string;
  tags: string[];
}

export interface ServiceCategory extends AuditFields, TenantScoped, DemoFields {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Service extends AuditFields, TenantScoped, DemoFields {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDurationMinutes: number;
  isActive: boolean;
}

export interface Technician extends AuditFields, TenantScoped, DemoFields {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  specialties: string[];
  certifications: string[];
  territory?: string;
  serviceAreaRadiusMiles?: number;
  hourlyRate: number;
  workloadPercent: number;
  averageRating: number;
  totalJobs: number;
  isActive: boolean;
  isAvailable: boolean;
  status: TechnicianStatus;
}

export interface Appointment extends AuditFields, TenantScoped, DemoFields {
  id: string;
  customerId: string;
  customerName: string;
  leadId?: string;
  technicianId?: string;
  technicianName?: string;
  serviceId?: string;
  serviceName: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  notes?: string;
  address: Address;
}

export interface EstimateItem {
  id: string;
  serviceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export interface Estimate extends AuditFields, TenantScoped, DemoFields {
  id: string;
  estimateNumber: string;
  leadId?: string;
  customerId: string;
  customerName: string;
  status: EstimateStatus;
  validUntil: string;
  scopeOfWork: string;
  notes?: string;
  items: EstimateItem[];
  subtotal: number;
  tax: number;
  total: number;
  sentAt?: string;
  approvedAt?: string;
}

export interface JobItem {
  id: string;
  description: string;
  quantity: number;
  status: 'pending' | 'done' | 'issue';
}

export interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  takenAt: string;
  type: 'before' | 'after' | 'progress';
}

export interface JobChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface JobChecklist {
  id: string;
  title: string;
  items: JobChecklistItem[];
}

export interface Job extends AuditFields, TenantScoped, DemoFields {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  estimateId?: string;
  appointmentId?: string;
  technicianIds: string[];
  technicianNames: string[];
  serviceAddress: Address;
  summary: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: JobStatus;
  items: JobItem[];
  photos: JobPhoto[];
  checklists: JobChecklist[];
  notes?: string;
  total: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment extends AuditFields, TenantScoped, DemoFields {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  reference?: string;
}

export interface Invoice extends AuditFields, TenantScoped, DemoFields {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  estimateId?: string;
  jobId?: string;
  status: InvoiceStatus;
  dueDate: string;
  issuedAt: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  balanceDue: number;
  payments: Payment[];
  notes?: string;
}

export interface Conversation extends AuditFields, TenantScoped, DemoFields {
  id: string;
  customerId?: string;
  leadId?: string;
  subject: string;
  channel: MessageChannel;
  participantIds: string[];
}

export interface Message extends AuditFields, TenantScoped, DemoFields {
  id: string;
  conversationId: string;
  senderId?: string;
  senderName: string;
  body: string;
  channel: MessageChannel;
  sentAt: string;
}

export interface Review extends AuditFields, TenantScoped, DemoFields {
  id: string;
  customerId: string;
  technicianId?: string;
  jobId?: string;
  rating: ReviewRating;
  title: string;
  body: string;
  source: 'google' | 'facebook' | 'manual';
}

export interface Automation extends AuditFields, TenantScoped {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  actionSummary: string;
  isActive: boolean;
}

export interface Integration extends AuditFields, TenantScoped {
  id: string;
  name: string;
  provider: string;
  status: IntegrationStatus;
  connectedAt?: string;
  lastSyncAt?: string;
}

export interface ActivityLog extends AuditFields, TenantScoped, DemoFields {
  id: string;
  entityType: 'lead' | 'customer' | 'appointment' | 'estimate' | 'job' | 'invoice' | 'system';
  entityId: string;
  actorId?: string;
  actorName: string;
  action: string;
  description: string;
}

export interface Notification extends AuditFields, TenantScoped, DemoFields {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
}

export interface AuthAccount extends AuditFields, TenantScoped, DemoFields {
  id: string;
  userId: string;
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  userId: string;
  organizationId: string;
}

export interface ThemeSettings {
  mode: ThemeMode;
  locale: SupportedLocale;
  timezone: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type QueryFilters<T> = Partial<{
  [K in keyof T]: T[K] extends Array<infer U> ? U | U[] : T[K] | T[K][];
}>;

export interface QueryOptions<T> extends PaginationParams {
  filters?: QueryFilters<T>;
  search?: string;
  searchFields?: Array<keyof T>;
  sortBy?: keyof T;
  sortDirection?: SortDirection;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ServiceError {
  message: string;
  code?: string;
  details?: string;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: ServiceError | null;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;
export type FormValidator<T> = (values: T) => FormErrors<T>;

export interface LeadFilters extends PaginationParams {
  status?: LeadStatus;
  priority?: LeadPriority;
  assignedToUserId?: string;
  query?: string;
}

export interface CustomerFilters extends PaginationParams {
  type?: CustomerType;
  query?: string;
}

export interface TechnicianFilters extends PaginationParams {
  status?: TechnicianStatus;
  query?: string;
}

export interface EstimateFilters extends PaginationParams {
  status?: EstimateStatus;
  query?: string;
}

export interface JobFilters extends PaginationParams {
  status?: JobStatus;
  technicianId?: string;
  query?: string;
}

export interface InvoiceFilters extends PaginationParams {
  status?: InvoiceStatus;
  query?: string;
}

export interface AppointmentFilters extends PaginationParams {
  technicianId?: string;
  status?: AppointmentStatus;
}

export interface ActivitySummary {
  label: string;
  value: number;
  change?: number;
}

export interface DashboardMetrics {
  leadsOpen: number;
  estimatesOutstanding: number;
  jobsToday: number;
  invoicesDue: number;
  revenueMonth: number;
  conversionRate: number;
}

export interface DatabaseTables {
  organizations: Organization;
  permissions: Permission;
  roles: Role;
  users: User;
  userInvites: UserInvite;
  leadSources: LeadSource;
  pipelineStages: PipelineStage;
  leads: Lead;
  customers: Customer;
  serviceCategories: ServiceCategory;
  services: Service;
  technicians: Technician;
  appointments: Appointment;
  estimates: Estimate;
  jobs: Job;
  invoices: Invoice;
  payments: Payment;
  conversations: Conversation;
  messages: Message;
  reviews: Review;
  automations: Automation;
  integrations: Integration;
  activityLogs: ActivityLog;
  notifications: Notification;
  authAccounts: AuthAccount;
}

export type DatabaseTableName = keyof DatabaseTables;

export interface AppDatabase {
  organizations: Organization[];
  permissions: Permission[];
  roles: Role[];
  users: User[];
  userInvites: UserInvite[];
  leadSources: LeadSource[];
  pipelineStages: PipelineStage[];
  leads: Lead[];
  customers: Customer[];
  serviceCategories: ServiceCategory[];
  services: Service[];
  technicians: Technician[];
  appointments: Appointment[];
  estimates: Estimate[];
  jobs: Job[];
  invoices: Invoice[];
  payments: Payment[];
  conversations: Conversation[];
  messages: Message[];
  reviews: Review[];
  automations: Automation[];
  integrations: Integration[];
  activityLogs: ActivityLog[];
  notifications: Notification[];
  authAccounts: AuthAccount[];
}

export type NewRecord<T extends { id: string; createdAt: string; updatedAt: string }> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
> &
  Partial<Pick<T, 'id' | 'createdAt' | 'updatedAt'>>;

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  organization: Organization | null;
  session: AuthSession | null;
}

