# ORINOKO AppSaaS - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Clone & Install
```bash
git clone https://github.com/orinokoflowsystems-stack/Orinoko-Local-SEO.git
cd Orinoko-Local-SEO
npm install
```

### Step 2: Supabase Setup
1. Go to supabase.com and create a free project
2. Get your URL and anon key from Settings → API
3. Copy to `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### Step 3: Database
1. In Supabase SQL Editor, run entire `SUPABASE_SCHEMA.sql`
2. Wait for completion (~30 seconds)

### Step 4: Run
```bash
npm run dev
```

Visit http://localhost:5173

---

## 📂 Essential Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component, routing |
| `src/main.tsx` | Entry point |
| `src/components/ui/` | Reusable UI components |
| `src/components/forms/` | Form components |
| `src/pages/` | Page components |
| `src/services/` | API calls, Supabase |
| `src/types/index.ts` | TypeScript definitions |
| `src/context/` | React Context providers |
| `src/hooks/` | Custom hooks |
| `SUPABASE_SCHEMA.sql` | Database schema |
| `.env.example` | Environment template |
| `tailwind.config.js` | Tailwind configuration |
| `package.json` | Dependencies |

---

## 🎨 Component Architecture

### Component Types

**UI Components** (reusable atoms)
```typescript
// src/components/ui/Button.tsx
<Button variant="primary" onClick={handleClick}>Click Me</Button>
```

**Form Components** (domain-specific forms)
```typescript
// src/components/forms/LeadForm.tsx
<LeadForm onSubmit={handleSubmit} />
```

**Page Components** (full page views)
```typescript
// src/pages/DashboardPage.tsx
export function DashboardPage() {
  return <div>Dashboard content</div>
}
```

**Layout Components**
```typescript
// src/components/AppShell.tsx
<AppShell>
  <Sidebar />
  <Header />
  <Main>{children}</Main>
</AppShell>
```

### Creating a Component

1. Create component file: `src/components/MyComponent.tsx`
2. Add TypeScript types for props
3. Use Tailwind CSS for styling
4. Export from component index if needed

```typescript
interface MyComponentProps {
  title: string
  onClick: () => void
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        onClick={onClick}
        className="mt-4 px-4 py-2 bg-blue-900 text-white rounded"
      >
        Action
      </button>
    </div>
  )
}
```

---

## 🗄️ Database Access

### Query Data
```typescript
import { supabase } from '@/services/supabase'

const { data, error } = await supabase
  .from('leads')
  .select('*')
  .eq('organization_id', orgId)

if (error) console.error(error)
return data
```

### Insert Data
```typescript
const { data, error } = await supabase
  .from('leads')
  .insert([
    {
      organization_id: orgId,
      first_name: 'John',
      email: 'john@example.com'
    }
  ])
```

### Update Data
```typescript
const { data, error } = await supabase
  .from('leads')
  .update({ status: 'contacted' })
  .eq('id', leadId)
```

### Delete Data
```typescript
const { error } = await supabase
  .from('leads')
  .delete()
  .eq('id', leadId)
```

### Real-time Subscription
```typescript
const subscription = supabase
  .from('jobs')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()

// Unsubscribe
subscription.unsubscribe()
```

---

## 🎯 Common Patterns

### Using Hooks for Data Fetching
```typescript
function MyComponent() {
  const { data, loading, error } = useAsync(() => 
    leadService.list(orgId)
  )

  if (loading) return <Spinner />
  if (error) return <Alert type="error">{error.message}</Alert>
  return <div>{/* render data */}</div>
}
```

### Form Handling
```typescript
function MyForm() {
  const { formData, errors, handleChange, handleSubmit } = useForm({
    initialValues: { name: '', email: '' },
    onSubmit: async (values) => {
      await leadService.create(values)
    },
    validate: (values) => {
      const errors: Record<string, string> = {}
      if (!values.name) errors.name = 'Name required'
      return errors
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
      />
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Using Context
```typescript
import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

function MyComponent() {
  const { user, organization } = useContext(AuthContext)
  return <div>Hello {user.name} in {organization.name}</div>
}
```

### Error Boundary
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

<ErrorBoundary fallback={<ErrorPage />}>
  <MyComponent />
</ErrorBoundary>
```

---

## 🌍 Translations

### Using Translations
```typescript
import { useTranslation } from '@/hooks/useTranslation'

function MyComponent() {
  const { t } = useTranslation()
  return <h1>{t('leads.title')}</h1>
}
```

### Translation Files
- `src/i18n/en.json` - English
- `src/i18n/es.json` - Spanish

### Adding Translations
```json
{
  "leads": {
    "title": "Leads",
    "list": "Lead List",
    "create": "Create Lead"
  }
}
```

---

## 🔑 Authentication Flow

### Sign Up
```typescript
const { user, error } = await authService.signUp(
  email,
  password,
  organizationName
)
```

### Sign In
```typescript
const { user, error } = await authService.signIn(email, password)
```

### Sign Out
```typescript
await authService.signOut()
```

### Check Auth Status
```typescript
const user = await authService.getCurrentUser()
```

---

## 🎨 Styling with Tailwind CSS

### Common Classes
```tsx
// Spacing
<div className="p-4 m-2">Padding and margin</div>

// Colors
<div className="bg-blue-900 text-white">ORINOKO Primary</div>
<div className="bg-orange-500 text-white">ORINOKO Accent</div>

// Layout
<div className="flex items-center justify-between">Flexbox</div>
<div className="grid grid-cols-3 gap-4">Grid</div>

// Typography
<h1 className="text-2xl font-bold">Heading</h1>
<p className="text-sm text-gray-600">Small gray text</p>

// Responsive
<div className="w-full md:w-1/2 lg:w-1/3">Responsive width</div>

// Hover/Active States
<button className="bg-blue-900 hover:bg-blue-800 active:bg-blue-950">
  Button
</button>

// Shadows & Borders
<div className="shadow-lg rounded-lg border border-gray-200">
  Card
</div>
```

---

## 📊 Data Models

### Lead
```typescript
interface Lead {
  id: string
  organization_id: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  service_requested?: string
  lead_source_id?: string
  priority: 'low' | 'normal' | 'high'
  status: string // pipeline stage
  assigned_to?: string
  notes?: string
  created_at: string
  updated_at: string
}
```

### Customer
```typescript
interface Customer {
  id: string
  organization_id: string
  first_name: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  total_spent: number
  job_count: number
  created_at: string
}
```

### Job
```typescript
interface Job {
  id: string
  organization_id: string
  job_number: string
  customer_id: string
  technician_id: string
  status: 'draft' | 'scheduled' | 'dispatched' | ... | 'paid'
  scheduled_date: string
  estimated_cost: number
  final_cost?: number
  created_at: string
}
```

See `src/types/index.ts` for complete type definitions.

---

## 🧪 Testing

### Run Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:ui       # Test UI
npm run test:coverage # Coverage report
```

### Test Patterns
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeDefined()
  })

  it('handles clicks', async () => {
    const handleClick = vi.fn()
    render(<MyComponent onClick={handleClick} />)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
})
```

---

## 🐛 Debugging Tips

### Browser DevTools
- React DevTools: Inspect component tree
- Network tab: Check API calls
- Console: View errors and logs
- Performance: Profile renders

### Supabase Studio
- SQL Editor: Direct database queries
- Authentication: View users and sessions
- Real-time: Monitor subscriptions
- Logs: Check request/response

### VS Code
- Set breakpoints (click line number)
- Step through code (F10)
- Watch expressions
- Debug console

### Common Issues
```typescript
// Check if user is authenticated
if (!user) {
  console.log('User not authenticated')
  return <SignInPage />
}

// Check data loading state
if (loading) return <Spinner />

// Check for API errors
if (error) {
  console.error('API Error:', error)
  return <ErrorMessage message={error.message} />
}

// Verify organization context
const { organization } = useContext(AuthContext)
console.log('Org ID:', organization?.id)
```

---

## 📦 Build & Deployment

### Development Build
```bash
npm run dev
```
- Fast incremental builds
- Hot Module Replacement (HMR)
- Source maps included
- No optimization

### Production Build
```bash
npm run build
```
- Minification (50% smaller)
- Code splitting
- Optimized bundle
- Source maps available

### Preview Production Build
```bash
npm run preview
```
- Serves production build locally
- No HMR, actual production config
- Good for testing before deploy

### Deploy to Vercel
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys from main branch
# View at: project-name.vercel.app
```

---

## 🔒 Security Checklist

- [ ] API keys only in `.env.local`
- [ ] `.env.local` in `.gitignore`
- [ ] Use anon key in frontend (not service role key)
- [ ] Validate all user input
- [ ] Use parameterized queries (Supabase client does this)
- [ ] RLS policies enabled on all tables
- [ ] Test multi-tenant isolation
- [ ] HTTPS in production
- [ ] Tokens stored securely
- [ ] Sensitive data not in logs

---

## 📞 Getting Help

### Documentation
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Deep technical guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [USER_GUIDE.md](./USER_GUIDE.md) - Features for users
- [SETUP.md](./SETUP.md) - Installation & deployment

### Common Questions

**Q: How do I add a new page?**
A: Create `src/pages/MyPage.tsx`, add route in `src/App.tsx`

**Q: How do I connect to Supabase?**
A: Use `supabase` client from `src/services/supabase.ts`

**Q: How do I add translations?**
A: Add key-value pair to `src/i18n/en.json` and `src/i18n/es.json`

**Q: How do I ensure multi-tenant isolation?**
A: Always filter by `organization_id` from user's context. RLS policies enforce this at DB level.

**Q: How do I deploy?**
A: See [SETUP.md](./SETUP.md#deployment-options) for options

### Still Need Help?
- Check existing docs and comments
- Review similar components in codebase
- Check TypeScript error messages
- Review Git history/commits
- Open GitHub issue

---

## 🚀 Performance Tips

### React
- Use `React.memo()` for expensive components
- Use `useMemo()` for expensive calculations
- Use `useCallback()` for event handlers
- Lazy load pages with `React.lazy()`

### Tailwind
- Unused classes are tree-shaken
- Dark mode ready (not currently enabled)
- Responsive classes included

### Supabase
- Use indexes for frequent queries
- Paginate large result sets
- Subscribe only to needed data
- Use select() to fetch only needed columns

### Bundling
```bash
npm run build:analyze  # See bundle size
```

---

## 📋 Daily Development Checklist

- [ ] Pull latest changes: `git pull`
- [ ] Install deps if needed: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Check TypeScript: `npm run type-check`
- [ ] Run tests: `npm run test`
- [ ] Follow code style: `npm run lint:fix`
- [ ] Format code: `npm run format`
- [ ] Test on mobile: Chrome DevTools (320px)
- [ ] Check console for errors
- [ ] Commit meaningful changes

---

## 🎓 Learning Resources

- [React Hooks Guide](https://react.dev/reference/react/hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Guide](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

---

**Quick Links**
- [Setup Instructions](./SETUP.md)
- [Development Guide](./DEVELOPMENT.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [User Guide](./USER_GUIDE.md)
- [Testing Guide](./TESTING.md)
- [Roadmap](./ROADMAP.md)

**Get Developing! 🚀**
