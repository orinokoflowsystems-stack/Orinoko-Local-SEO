# Security and Production Deployment Guide

## ⚠️ CRITICAL SECURITY NOTICE

This MVP uses **demo/development mode with localStorage-backed storage**. This is NOT suitable for production environments with real customer data.

---

## Demo Mode Limitations

### What's Demo-Only
- ✗ localStorage for session tokens
- ✗ localStorage for appointment/customer data
- ✗ Unencrypted demo data storage
- ✗ No real encryption at rest
- ✗ No encryption in transit (though https required for prod)

### What's Production-Ready
- ✓ TypeScript type safety
- ✓ Component architecture
- ✓ UI/UX design system
- ✓ Multi-tenant database schema (Row Level Security)
- ✓ Supabase integration structure
- ✓ Error handling patterns
- ✓ Internationalization
- ✓ Form validation framework

---

## Transitioning to Production

### Phase 1: Remove Demo Storage (Week 1)
```typescript
// DELETE: src/services/storage.ts
// DELETE: src/data/demo.ts
// This forces use of real Supabase API
```

### Phase 2: Enable Supabase Auth (Week 1-2)
```typescript
// Verify in .env.local:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

// This automatically:
// - Uses Supabase Auth (not localStorage)
// - Stores tokens in httpOnly cookies
// - Enforces Row Level Security
// - Encrypts data in transit (HTTPS required)
```

### Phase 3: Database Initialization (Week 2)
```sql
-- Run SUPABASE_SCHEMA.sql in Supabase SQL Editor
-- This creates all 40+ tables with:
-- - Row Level Security policies
-- - Proper indexes
-- - Foreign key constraints
-- - Audit logs
```

### Phase 4: Enable Security Features (Week 2-3)

#### 1. HTTPS (Required)
```bash
# Vercel/Netlify: Automatic
# Self-hosted: Use Let's Encrypt + nginx/caddy
```

#### 2. Content Security Policy
```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'wasm-unsafe-eval'; 
           style-src 'self' 'unsafe-inline';
           img-src 'self' data: https:;
           font-src 'self';
           connect-src 'self' https://your-project.supabase.co;">
```

#### 3. Secure Headers (nginx example)
```nginx
# X-Frame-Options: Prevent clickjacking
add_header X-Frame-Options "SAMEORIGIN" always;

# X-Content-Type-Options: Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# X-XSS-Protection: Enable XSS protection
add_header X-XSS-Protection "1; mode=block" always;

# Referrer-Policy: Control referrer information
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# HSTS: Enforce HTTPS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

#### 4. Environment Variables (Never in code)
```bash
# .env.local (NEVER committed to git)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key

# Backend only (if you add Node backend):
SUPABASE_SERVICE_ROLE_KEY=your-secret-service-key
```

### Phase 5: Row Level Security Verification (Week 3)

Test that users cannot access other organizations' data:

```typescript
// Attempt to query another org's leads
const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('organization_id', 'other-org-id');

// Result: Returns empty array (RLS blocks access)
// This is the key security mechanism!
```

---

## Security Checklist for Production

### Before Going Live
- [ ] Remove localStorage demo storage
- [ ] Enable Supabase Auth with httpOnly cookies
- [ ] Run SUPABASE_SCHEMA.sql in production Supabase project
- [ ] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [ ] Enable HTTPS on domain
- [ ] Set Content-Security-Policy headers
- [ ] Set X-Frame-Options header (SAMEORIGIN)
- [ ] Set X-Content-Type-Options header (nosniff)
- [ ] Set Strict-Transport-Security header
- [ ] Enable HSTS (max-age=31536000)
- [ ] Test multi-tenant isolation (RLS)
- [ ] Test authentication flows
- [ ] Enable audit logging
- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable CORS for API calls
- [ ] Review Supabase security settings
- [ ] Enable database backups
- [ ] Set up monitoring and alerts

### Ongoing Security
- [ ] Monitor for security vulnerabilities: `npm audit`
- [ ] Update dependencies monthly: `npm update`
- [ ] Review access logs for suspicious activity
- [ ] Implement rate limiting for API calls
- [ ] Monitor for unauthorized access attempts
- [ ] Regular security audits
- [ ] Keep Supabase and dependencies updated
- [ ] Review Row Level Security policies
- [ ] Test disaster recovery procedures
- [ ] Implement DDoS protection (Cloudflare recommended)

---

## Key Security Principles in ORINOKO AppSaaS

### 1. Multi-Tenant Data Isolation

Every query includes `organization_id` check:

```sql
-- RLS Policy Example:
CREATE POLICY "Users can only see their org's leads"
  ON leads
  USING (organization_id = (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));
```

This means:
- ✅ Technically impossible to query another organization's data
- ✅ Enforced at database layer (not application layer)
- ✅ Works even if app code has bugs
- ✅ Requires Supabase Auth to be enabled

### 2. Authentication Flow

```
User -> Sign In -> Supabase Auth
       -> JWT Token -> Browser
       -> httpOnly Cookie -> Secure Storage
       -> API Call -> Supabase checks JWT
       -> Row Level Security checks org_id
       -> Returns only authorized data
```

### 3. API Authorization Pattern

```typescript
// Every API call is:
// 1. Authenticated (require valid JWT)
// 2. Authorized (RLS checks organization_id)
// 3. Audited (logged in activity_logs table)

const { data } = await supabase
  .from('leads')
  .select('*')
  .eq('organization_id', currentOrgId); // RLS handles this check
```

### 4. Secure Data Storage

**In Transit**: HTTPS/TLS (enforced in production)  
**At Rest**: Supabase encrypted backups  
**In Memory**: Only in React state (cleared on logout)  
**In Browser**: Only non-sensitive UI state  

### 5. Secret Management

**Never commit:**
- API keys
- Database passwords
- JWT secrets
- OAuth tokens
- API credentials

**Always use:**
- Environment variables (.env.local)
- GitHub Secrets for CI/CD
- Secure vaults (Vercel, Netlify)
- Supabase environment variables

---

## Common Security Issues to Avoid

### ❌ Don't
```typescript
// ❌ WRONG: Storing tokens in localStorage
localStorage.setItem('auth_token', token);

// ❌ WRONG: Committing credentials to git
const API_KEY = 'sk_live_123456';

// ❌ WRONG: Accepting organization_id from user input
const data = await fetch(`/api/leads?org_id=${userInput}`);

// ❌ WRONG: Trusting client-side role validation
if (currentUser.role === 'admin') { /* allow */ }

// ❌ WRONG: Storing passwords in plain text
users.password = plainTextPassword;

// ❌ WRONG: Logging sensitive data
console.log('User token:', token);
```

### ✅ Do
```typescript
// ✅ RIGHT: Supabase Auth handles tokens
const { data: session } = await supabase.auth.getSession();
// Token stored in httpOnly cookie automatically

// ✅ RIGHT: Environment variables only
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// ✅ RIGHT: Let database enforce security
const { data } = await supabase
  .from('leads')
  .select('*');
// RLS automatically filters by current user's org_id

// ✅ RIGHT: Server-side authorization
// Verify role in backend using Supabase RLS policies

// ✅ RIGHT: Hash passwords with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);

// ✅ RIGHT: Never log sensitive data
console.log('Authentication successful');
```

---

## Deployment Checklist by Platform

### Vercel
- [ ] Connect GitHub repository
- [ ] Set environment variables in Vercel dashboard
- [ ] Enable auto-deployments
- [ ] Configure custom domain (auto HTTPS)
- [ ] Set up error tracking
- [ ] Monitor analytics

### Netlify
- [ ] Connect GitHub repository
- [ ] Set environment variables in Netlify dashboard
- [ ] Enable auto-deployments
- [ ] Configure custom domain (auto HTTPS)
- [ ] Set up Netlify Functions for backend
- [ ] Monitor logs

### Self-Hosted (Docker)
- [ ] Install Docker
- [ ] Create Dockerfile (provided)
- [ ] Set environment variables
- [ ] Set up nginx/caddy for HTTPS
- [ ] Configure Let's Encrypt
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Set up CI/CD (GitHub Actions)

---

## Incident Response Plan

### If Credentials Are Exposed
1. Revoke all tokens immediately
2. Change all passwords
3. Rotate API keys
4. Enable audit logging
5. Review access logs
6. Notify affected users
7. Implement stricter monitoring

### If Data Breach Detected
1. Isolate affected systems
2. Preserve evidence (logs)
3. Determine scope of compromise
4. Notify users immediately
5. Provide credit monitoring if needed
6. Cooperate with authorities
7. Implement remediation measures
8. Increase monitoring

### If Service Is Unavailable
1. Check Supabase status page
2. Check error logs
3. Review recent deployments
4. Rollback if necessary
5. Communicate status to users
6. Post-mortem analysis

---

## Additional Resources

- **Supabase Security**: https://supabase.com/docs/guides/security
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **React Security Best Practices**: https://react.dev/learn/security
- **Vercel Security**: https://vercel.com/security
- **Netlify Security**: https://docs.netlify.com/security/secure-access-control/

---

## Questions?

For security issues, contact: security@orinoko.com

For vulnerabilities, use: https://github.com/orinokoflowsystems-stack/Orinoko-Local-SEO/security/advisories/new
