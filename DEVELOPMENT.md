# ORINOKO AppSaaS - Development Guide

## Overview

ORINOKO AppSaaS is a comprehensive field service management SaaS platform built with React, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: React Context + Custom Hooks
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Routing**: React Router v6

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Header, Sidebar, etc.)
│   ├── forms/          # Form components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── modules/        # Feature-specific components
├── pages/              # Page components (full-page views)
├── hooks/              # Custom React hooks
├── services/           # API calls and external services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── styles/             # Global CSS and Tailwind overrides
├── config/             # Configuration files
├── context/            # React Context providers
├── App.tsx             # Main App component
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run dev server: `npm run dev`

### Environment Variables

Required variables in `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
VITE_APP_NAME=ORINOKO AppSaaS
VITE_API_TIMEOUT=30000
```

## Development Workflow

### Creating a New Feature

1. **Define Types** - Update `src/types/index.ts` with new types
2. **Create API Service** - Add functions in `src/services/`
3. **Build Components** - Create components in `src/components/modules/`
4. **Create Pages** - Add page in `src/pages/`
5. **Wire Routes** - Update routing in `App.tsx`
6. **Add Styling** - Use Tailwind classes, no need for separate CSS

### Components Best Practices

- Keep components small and focused (200-300 lines max)
- Export components from `index.ts` files for clean imports
- Use TypeScript generics for reusable components
- Document complex component logic with comments
- Use Tailwind CSS utility classes exclusively

### Naming Conventions

- Components: PascalCase (e.g., `UserProfile.tsx`)
- Utilities/Hooks: camelCase (e.g., `useAuth.ts`)
- Types: PascalCase (e.g., `User.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- CSS Classes: kebab-case (Tailwind default)

## Authentication

Authentication is handled through Supabase Auth. 

- Sign up creates a new user record in `auth.users`
- User profile data is stored in `users` table with organization relationship
- Role-based access control via `roles` and `role_permissions` tables
- Row Level Security (RLS) policies enforce multi-tenant data isolation

## Multi-Tenancy

The application is built with multi-tenancy at its core:

- Every user belongs to exactly one organization
- All data tables include `organization_id` foreign key
- RLS policies ensure users can only see their organization's data
- Data is completely isolated between organizations at the database level

## Styling & Theme

ORINOKO Brand Colors:
- Primary Dark Blue: `#1e3a8a` (used in Tailwind as `blue-900`)
- Accent Orange: `#ff8c42` (used in Tailwind as `orange-500`)
- Neutral Grays: `#f3f4f6`, `#e5e7eb`, `#d1d5db`, `#9ca3af`

Use Tailwind CSS for all styling:
- Responsive: `sm:`, `md:`, `lg:`, `xl:`, `2xl:` prefixes
- Dark mode ready but not currently implemented
- Mobile-first approach

## Database & Supabase

### Running Migrations

SQL files for database schema are in `SUPABASE_SCHEMA.sql`.

To set up the database:
1. Go to Supabase dashboard
2. Open SQL editor
3. Copy and run the contents of `SUPABASE_SCHEMA.sql`

### Accessing Database

Use the Supabase TypeScript client:

```typescript
import { supabase } from '@/services/supabase'

// Query data
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('organization_id', orgId)

// Insert data
const { data, error } = await supabase
  .from('users')
  .insert([{ name: 'John', organization_id: orgId }])

// Real-time subscriptions
const subscription = supabase
  .from('jobs')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## API Layer

API calls are organized in `src/services/` with one file per entity:

- `src/services/leads.ts` - Lead operations
- `src/services/customers.ts` - Customer operations
- `src/services/jobs.ts` - Job operations
- `src/services/invoices.ts` - Invoice operations
- etc.

Each service file exports async functions that use Supabase client.

## Internationalization (i18n)

The app is bilingual (English/Spanish). Translations are managed via:

- Translation files in `src/i18n/` (en.json, es.json)
- Custom `useTranslation()` hook for accessing strings
- Language preference stored in organization settings
- Language switcher in user menu

Example usage:
```typescript
const { t } = useTranslation()
return <h1>{t('dashboard.title')}</h1>
```

## State Management

Use React Context + Hooks pattern:

- `AuthContext` - Current user and organization
- `OrganizationContext` - Organization settings and permissions
- Local component state with `useState` for UI state
- Custom hooks for complex logic

Avoid prop drilling by using Context for global state.

## Error Handling

- Use try-catch blocks in async operations
- Display user-friendly error messages via toast/modal
- Log errors to console in development
- Implement error boundaries for React components
- Show loading states during async operations

## Testing

Tests use Vitest + React Testing Library:

```bash
npm run test           # Run tests
npm run test:ui        # Open UI for test exploration
npm run test:coverage  # Generate coverage report
```

## Building & Deployment

### Development
```bash
npm run dev      # Start dev server with hot reload
```

### Production Build
```bash
npm run build    # Build for production
npm run preview  # Preview production build locally
```

### Deployment

The app is optimized for deployment to:
- Vercel (recommended, auto-detects Vite projects)
- Netlify
- Self-hosted on any static hosting

Environment variables should be set in deployment platform's configuration.

## Git Workflow

- Main branch: `main` (production)
- Feature branches: `feature/description`
- Bugfix branches: `bugfix/description`
- Always create PRs before merging to main

Commit message format:
```
feat: Add new feature description
fix: Fix bug description
docs: Update documentation
style: Format code
refactor: Restructure code
chore: Maintenance tasks
```

## Performance Optimization

- Code splitting via React.lazy() for page components
- Image optimization (WebP, lazy loading)
- Memoization of expensive components with React.memo
- Efficient re-renders with proper dependency arrays
- Debounce/throttle for search and scroll handlers

## Security

- Never expose API keys or secrets in code
- All sensitive data handled server-side via Supabase
- CORS configured properly in Supabase
- SQL injection prevented via parameterized queries
- XSS protection via React's built-in escaping
- Implement rate limiting for API calls
- Validate all user input on frontend and backend

## Debugging

### Browser DevTools
- React DevTools extension for component inspection
- Network tab for API debugging
- Console for error messages

### Supabase Studio
- SQL editor for direct database queries
- Real-time monitoring of database changes
- View API logs and authentication events

### VS Code Extensions
- ESLint for code quality
- Prettier for code formatting
- Tailwind CSS IntelliSense for class suggestions

## Troubleshooting

### Common Issues

**Q: CORS errors when calling Supabase API**
- Check VITE_SUPABASE_URL and VITE_SUPABASE_KEY are correct
- Verify Supabase project settings allow the app domain

**Q: RLS policy denying access**
- Check user is authenticated (auth.uid() returns valid ID)
- Verify organization_id matches user's organization
- Check policy syntax in SUPABASE_SCHEMA.sql

**Q: Build fails with TypeScript errors**
- Run `npm install` to ensure dependencies are up to date
- Check type definitions match usage
- Verify no unused imports/variables

**Q: Styling not applying**
- Ensure Tailwind CSS is properly configured in tailwind.config.js
- Check class names match Tailwind syntax
- Clear build cache: `rm -rf .vite node_modules`

## Contributing

1. Create feature branch from main
2. Make changes following conventions above
3. Test locally before creating PR
4. Write descriptive PR with context
5. Wait for code review before merging

## Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## Contact & Support

For questions or issues:
- Check existing documentation
- Review code comments and commit history
- Ask team members in development channel
