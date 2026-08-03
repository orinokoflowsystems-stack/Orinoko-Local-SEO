# ORINOKO AppSaaS - Architecture & API Guide

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (React 18)                         │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Pages       │  │  Components  │  │   Hooks/Context  │  │
│  │   Router      │  │   Forms      │  │   State Mgmt     │  │
│  └───────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Services Layer (TypeScript)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Supabase API │  │ Auth Service │  │  Data Services   │  │
│  │   Client     │  │              │  │  (Leads, Jobs,   │  │
│  │              │  │              │  │   etc.)          │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│            Supabase (Backend + Database)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database with RLS Policies              │   │
│  │  - Multi-tenant isolation (organization_id)         │   │
│  │  - Row Level Security (auth.uid())                  │   │
│  │  - 30+ tables for all business entities             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Supabase Auth                                      │   │
│  │  - Email/password authentication                    │   │
│  │  - JWT token management                            │   │
│  │  - Session handling                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Real-time Subscriptions                           │   │
│  │  - Push updates to clients                         │   │
│  │  - Live notifications                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Multi-Tenancy Architecture

### Key Principles

1. **Complete Data Isolation**
   - Every user belongs to exactly one organization
   - Every business record includes organization_id
   - Database policies prevent cross-organization access

2. **RLS (Row Level Security)**
   - All tables have RLS enabled
   - Policies check `auth.uid()` matches user and organization
   - Database enforces security, not just application

3. **Organization-Scoped APIs**
   - All queries automatically filtered by user's organization_id
   - Clients never need to specify organization in requests
   - Impossible to access other organization's data

### Data Flow

```
User Signs In → Auth Service validates → Get user with org_id → 
Set in context → All API calls auto-filter by org_id → 
RLS policies enforce at database level → Only org data returned
```

## Authentication Flow

### Sign Up Flow

```
1. User enters email, password, personal info
   ↓
2. Client calls auth.signUp(email, password)
   ↓
3. Supabase creates auth.users record
   ↓
4. Trigger creates users table record with organization_id
   ↓
5. Create organization record
   ↓
6. Assign admin role to user
   ↓
7. User logged in, redirected to dashboard
```

### Sign In Flow

```
1. User enters email and password
   ↓
2. Client calls auth.signIn(email, password)
   ↓
3. Supabase validates credentials, returns JWT
   ↓
4. JWT stored in localStorage and request headers
   ↓
5. Client fetches user record with organization
   ↓
6. Set in AuthContext
   ↓
7. User can access protected pages
```

### Session Management

- JWT tokens expire (default 1 hour for access, 7 days for refresh)
- Refresh token used to get new access token
- Logout clears tokens from localStorage and server session
- Auto-logout on token expiration

## Database Design

### Core Tables

#### Organizations
- Multi-tenant root entity
- Stores company settings, branding, subscription info
- All other entities reference this via organization_id

#### Users
- User accounts linked to auth.users
- Multiple users per organization
- Includes role_id for RBAC

#### Roles & Permissions
- Role-based access control
- System roles: admin, dispatcher, technician, customer
- Custom roles supported
- Permissions granular: read, create, update, delete per entity

#### Leads
- Prospective customers
- Fields: name, contact, service, source, priority, status
- Status = pipeline stage
- Can be converted to Customers

#### Customers
- Actual customers
- Linked to lead if came from lead
- Tracks total spent, job count
- Can have multiple contacts

#### Appointments
- Calendar entries
- Links customer, technician, service, date/time
- Status tracking (scheduled, confirmed, cancelled)

#### Technicians
- Field service personnel
- Profile with specialties, certifications
- Availability/schedule
- Performance metrics (ratings, avg job duration)

#### Services
- Company's offerings
- Name, description, base price, duration
- Categorized for filtering

#### Estimates
- Quotes for customers
- Line items with services/materials
- Status workflow: draft → sent → approved
- Can be converted to Jobs

#### Jobs
- Work orders for completed/in-progress work
- Full lifecycle: draft → scheduled → dispatched → in progress → completed
- Links to estimate, customer, technician, location
- Contains photos, notes, checklists
- Tracked for invoicing

#### Invoices
- Billing documents
- Generated from completed jobs
- Tracks payment status
- Links to payments

#### Payments
- Individual payment records
- Links to invoices
- Tracks payment method and date
- Amount and status

#### Conversations & Messages
- Omnichannel communication
- Links customer and organization
- Messages track sender, channel, content

#### Reviews
- Customer feedback
- Links job, customer, technician
- 1-5 star rating with comment

### Table Relationships

```
Organizations (root)
├── Users (1:M) → auth.users
├── Locations (1:M)
├── Roles (1:M)
├── Services (1:M)
├── Technicians (1:M) → Users
├── Customers (1:M)
│   ├── Leads (1:1) → Leads
│   ├── Appointments (1:M) → Appointments
│   ├── Conversations (1:M) → Messages
│   ├── Estimates (1:M)
│   │   └── Estimate Items (1:M)
│   ├── Jobs (1:M)
│   │   ├── Job Items (1:M)
│   │   ├── Job Photos (1:M)
│   │   ├── Job Checklists (1:M)
│   │   └── Reviews (1:M)
│   └── Invoices (1:M)
│       ├── Invoice Items (1:M)
│       └── Payments (1:M)
├── Leads (1:M)
├── Pipeline Stages (1:M)
├── Lead Sources (1:M)
├── Conversations (1:M)
├── Reviews (1:M)
├── Automations (1:M)
├── Integrations (1:M)
├── Activity Logs (1:M)
└── Notifications (1:M) → Users
```

## API Service Layer

### Service File Structure

Each entity has a service file in `src/services/` with consistent patterns:

```typescript
// src/services/leads.ts
import { supabase } from './supabase'
import type { Lead, CreateLeadInput, UpdateLeadInput } from '@/types'

// List leads with pagination/filtering
export const listLeads = async (
  organizationId: string,
  filters?: LeadFilters,
  page?: number,
  limit?: number
): Promise<{ data: Lead[], total: number }> => {
  // Implementation
}

// Get single lead
export const getLead = async (id: string): Promise<Lead> => {
  // Implementation
}

// Create lead
export const createLead = async (
  organizationId: string,
  input: CreateLeadInput
): Promise<Lead> => {
  // Implementation
}

// Update lead
export const updateLead = async (
  id: string,
  input: UpdateLeadInput
): Promise<Lead> => {
  // Implementation
}

// Delete lead
export const deleteLead = async (id: string): Promise<void> => {
  // Implementation
}

// Status-specific operations
export const updateLeadStatus = async (id: string, status: string): Promise<Lead> => {
  // Implementation
}

export const assignLead = async (id: string, userId: string): Promise<Lead> => {
  // Implementation
}
```

### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('organization_id', orgId)

  if (error) throw new Error(error.message)
  return data
} catch (error) {
  console.error('Error fetching data:', error)
  throw new ApiError(
    error instanceof Error ? error.message : 'Unknown error',
    'FETCH_ERROR'
  )
}
```

## Component Architecture

### Component Hierarchy

```
App
├── AuthLayout
│   ├── SignUpPage
│   └── SignInPage
└── AppShell
    ├── Sidebar (navigation)
    ├── Header (user menu, notifications)
    └── MainContent
        ├── DashboardPage
        ├── LeadsPage
        │   └── LeadDetailPage
        ├── CustomersPage
        │   └── CustomerDetailPage
        ├── CalendarPage
        ├── JobsPage
        │   └── JobDetailPage
        ├── EstimatesPage
        │   └── EstimateDetailPage
        ├── InvoicesPage
        │   └── InvoiceDetailPage
        ├── TechniciansPage
        │   └── TechnicianDetailPage
        └── SettingsPage
```

### Component Types

1. **Layout Components**: Structure page layout
   - AppShell, AuthLayout, PageHeader

2. **Page Components**: Full-page views
   - DashboardPage, LeadsPage, CustomersPage, etc.

3. **Feature Components**: Business logic for features
   - LeadKanban, CalendarView, EstimateBuilder, etc.

4. **Form Components**: Reusable form sections
   - LeadForm, CustomerForm, EstimateForm, etc.

5. **UI Components**: Atomic building blocks
   - Button, Card, Input, Modal, Table, etc.

## State Management Strategy

### Global State (Context)
- **AuthContext**: Current user, organization, permissions
- **OrganizationContext**: Organization settings
- **ThemeContext**: Language, colors, timezone

### Local State (useState)
- Form inputs
- UI state (modals open/closed, filters active)
- Expanded/collapsed sections

### Server State (Queries)
- Use custom useAsync hook for data fetching
- Cache data with simple memoization
- Invalidate on mutations

### Pattern Example

```typescript
// Using context
const { user, organization } = useContext(AuthContext)

// Local UI state
const [isModalOpen, setIsModalOpen] = useState(false)

// Form state
const { formData, errors, handleChange } = useForm({
  initialValues: { name: '' },
  validate: (values) => { /* validation */ }
})

// Async data loading
const { data: leads, loading, error } = useAsync(() => 
  leadService.list(organization.id)
)
```

## Internationalization (i18n)

### Translation File Structure

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "dashboard": {
    "title": "Dashboard",
    "newLeads": "New Leads",
    "todayRevenue": "Today's Revenue"
  },
  "leads": {
    "title": "Leads",
    "list": "Lead List",
    "create": "Create Lead"
  }
  // ... more sections
}
```

### Usage

```typescript
import { useTranslation } from '@/hooks/useTranslation'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('leads.title')}</h1>
}
```

## Error Handling Strategy

### Error Types

```typescript
class ApiError extends Error {
  constructor(message: string, code: string) {
    super(message)
    this.code = code
  }
}

class ValidationError extends Error {
  constructor(message: string, field?: string) {
    super(message)
    this.field = field
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Not authorized') {
    super(message)
  }
}
```

### Error Boundaries

- Wrap page content in ErrorBoundary
- Catch React component errors
- Display fallback UI with option to retry/return home

### Validation

- Client-side form validation before submit
- Provide immediate feedback on validation errors
- Server-side validation happens at Supabase via RLS

## Performance Optimization

1. **Code Splitting**
   - Lazy load page components with React.lazy()
   - Separate vendor chunks (React, Supabase)

2. **Memoization**
   - React.memo for pure components
   - useMemo for expensive computations
   - useCallback for event handlers

3. **Data Loading**
   - Pagination for large lists
   - Lazy load images
   - Debounce search queries

4. **Bundle Size**
   - Tree-shaking of unused code
   - Minification in production
   - Monitor with Vite bundle analyzer

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Secure token storage (localStorage with httpOnly consideration)
   - Refresh token rotation

2. **Authorization**
   - RLS policies at database level (primary defense)
   - Application-level checks for extra validation
   - Role-based permission checks

3. **Data Protection**
   - HTTPS only
   - No sensitive data in URLs
   - Encrypt sensitive fields in database (future)

4. **Input Validation**
   - Validate and sanitize all user inputs
   - Use parameterized queries (Supabase client does this)
   - Prevent SQL injection via RLS + parameterization

5. **API Security**
   - CORS properly configured
   - Rate limiting (future)
   - API key rotation for integrations

## Testing Strategy

### Unit Tests
- Utility functions
- Hooks logic
- Component rendering

### Integration Tests
- API service calls
- Form submission
- Navigation flows

### E2E Tests
- Complete user workflows
- Multi-step processes
- Error scenarios

### Manual Testing Checklist
- [ ] Multi-tenant data isolation
- [ ] RBAC enforcement
- [ ] All CRUD operations per entity
- [ ] Form validation
- [ ] Error states
- [ ] Loading states
- [ ] Responsive design
- [ ] Bilingual support
- [ ] Performance baseline

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Auth system enabled
- [ ] RLS policies active
- [ ] Demo data seeded (if needed)
- [ ] Build passes without errors
- [ ] No console errors/warnings
- [ ] No secrets in code
- [ ] CORS headers configured
- [ ] SSL/HTTPS enabled
- [ ] Monitoring/logging configured
- [ ] Backup strategy in place

## Monitoring & Observability

### Logs to Collect
- API response times
- Error rates and types
- User actions (for audit trail)
- Authentication events
- Data modification audit trail

### Metrics to Track
- Uptime/availability
- Response time percentiles (p50, p95, p99)
- Error rate by endpoint
- Database query performance
- Active user count

### Tools (Future)
- Sentry for error tracking
- LogRocket for session replay
- Datadog or New Relic for APM
- Supabase Studio for database monitoring

## Scaling Considerations

### Short Term (MVP)
- Single Supabase project
- Shared database for all organizations
- Basic indexing
- Row count limits per table: 1M+ rows

### Medium Term
- Database optimization (more indexes, query optimization)
- Caching layer (Redis)
- API rate limiting
- Separate test/staging environments

### Long Term
- Read replicas for reporting
- CDN for static assets
- Sharding for massive scale
- Data warehousing for analytics

## Future Integration Points

### Payment Processing
- Stripe API for credit card processing
- Square for cash/card at location
- Recurring billing engine

### Communications
- Twilio for SMS
- SendGrid for email
- WhatsApp Business API
- Email service via Resend or SendGrid

### Maps & Routing
- Google Maps API for location display
- Directions and routing for technicians
- Geofencing for arrival detection

### AI Services
- OpenAI for AI Agent responses
- Claude for content generation
- Custom NLP for intent detection

### Analytics & Reporting
- Google Analytics integration
- Custom data warehouse queries
- Report generation service

### External Integrations
- Google Calendar sync
- Google Business Profile management
- Zapier/Make.com webhooks
- Custom API for third-party systems

## Conclusion

This architecture is designed to be:
- **Scalable**: Multi-tenant from ground up, database performance optimized
- **Secure**: RLS policies enforce access control, authentication via Supabase
- **Maintainable**: Clear separation of concerns, consistent patterns
- **Flexible**: Easy to add new features, modify workflows
- **User-Friendly**: Responsive design, bilingual support, intuitive UX
