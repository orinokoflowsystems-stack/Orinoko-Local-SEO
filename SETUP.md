# ORINOKO AppSaaS - Setup & Deployment Guide

## Prerequisites

- Node.js 16+ (verify with `node --version`)
- npm or yarn package manager
- Git
- Supabase account (supabase.com)
- Code editor (VS Code recommended)

## Local Development Setup

### 1. Clone Repository

```bash
cd /path/to/project
git clone https://github.com/orinokoflowsystems-stack/Orinoko-Local-SEO.git
cd Orinoko-Local-SEO
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

This will install:
- React 18 and TypeScript
- Vite build tool
- Tailwind CSS
- React Router for navigation
- Supabase client library
- Additional utilities

### 3. Set Up Supabase Project

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Enter project details:
   - Name: "ORINOKO AppSaaS"
   - Database Password: (strong password, save it)
   - Region: (closest to users)
5. Click "Create new project" (takes ~2-3 minutes)

#### Get API Keys
1. Once project is created, go to "Settings" → "API"
2. Copy:
   - `Project URL` → Use as `VITE_SUPABASE_URL`
   - `anon` key (public) → Use as `VITE_SUPABASE_KEY`

#### Set Up Database Schema
1. In Supabase, go to "SQL Editor"
2. Click "New Query"
3. Copy entire contents of `SUPABASE_SCHEMA.sql` from this repo
4. Paste into SQL editor
5. Click "Run" to execute (takes ~30 seconds)
6. Verify tables appear in "Table Editor"

#### Enable RLS (Row Level Security)
The schema already includes RLS policies, but verify they're active:
1. Go to "Authentication" → "Policies"
2. Verify policies exist for each table
3. All should show as "Enabled"

#### Set Up Authentication
1. Go to "Authentication" → "Providers"
2. Email authentication should be enabled by default
3. For signup, go to "Authentication" → "Email Templates"
4. Customize confirmation email if desired

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Edit `.env.local` with your Supabase credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key-here

# App Configuration
VITE_APP_NAME=ORINOKO AppSaaS
VITE_API_TIMEOUT=30000
VITE_API_BASE_URL=https://your-project.supabase.co
```

**NEVER commit `.env.local` to Git!** It should be in `.gitignore`.

### 5. Start Development Server

```bash
npm run dev
```

This starts Vite dev server (usually at http://localhost:5173)

Features:
- Hot Module Replacement (HMR) - changes appear instantly
- Fast builds with Vite
- TypeScript checking

## Project Structure Overview

```
project-root/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── ui/          # Base UI components
│   │   ├── forms/       # Form components
│   │   ├── common/      # Header, Sidebar, etc.
│   │   └── modules/     # Feature-specific components
│   ├── pages/           # Page components
│   ├── services/        # API services, Supabase client
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   ├── utils/           # Utility functions
│   ├── styles/          # Global CSS
│   ├── config/          # Configuration
│   ├── i18n/            # Translations (EN/ES)
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── SUPABASE_SCHEMA.sql  # Database schema
├── DEVELOPMENT.md       # Developer guide
├── ARCHITECTURE.md      # System architecture
├── ROADMAP.md          # Feature roadmap
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies
└── .env.example        # Example environment variables
```

## Database Setup Verification

After running the SQL schema, verify tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables (~40):
- organizations
- users
- roles
- leads
- customers
- technicians
- appointments
- services
- estimates
- jobs
- invoices
- payments
- conversations
- messages
- reviews
- ... and more

## Demo Data Seeding

The app includes demo company "Handy Glass & Door LLC" with sample data.

To seed demo data (runs automatically on first login to empty organization):

1. Create an account and organization
2. Demo data will auto-populate on dashboard first load
3. Or manually run seed script (future feature)

## Running Tests

### Run All Tests
```bash
npm run test
```

### Watch Mode (re-run on file changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### UI Test Explorer
```bash
npm run test:ui
```

## Linting & Code Quality

### Run ESLint
```bash
npm run lint
```

### Fix Linting Issues Automatically
```bash
npm run lint:fix
```

### Format Code with Prettier
```bash
npm run format
```

### Type Check
```bash
npm run type-check
```

## Building for Production

### Create Production Build
```bash
npm run build
```

This:
- Bundles all code
- Minifies and optimizes
- Creates `dist/` folder
- Generates source maps (optional)

### Preview Production Build Locally
```bash
npm run preview
```

This serves the production build locally to test before deployment.

### Build Analysis
```bash
npm run build:analyze
```

Shows which packages take up the most space in the bundle.

## Deployment Options

### Option 1: Vercel (Recommended for React)

#### Prerequisites
- GitHub account with repository
- Vercel account (free at vercel.com)

#### Steps
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Add New..." → "Project"
4. Select GitHub repository
5. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
6. Click "Deploy"
7. Vercel builds and deploys automatically
8. Get URL for live site

#### Benefits
- Zero-config for Vite/React
- Automatic deployments on git push
- Edge functions support
- Free tier available

### Option 2: Netlify

#### Prerequisites
- GitHub account
- Netlify account (free at netlify.com)

#### Steps
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select GitHub repo
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Add environment variables
8. Click "Deploy site"

#### Benefits
- Continuous deployment from Git
- Form handling included
- Good free tier
- Simple setup

### Option 3: Self-Hosted (Docker + Your Server)

#### Prerequisites
- Server or VPS (AWS, DigitalOcean, Linode, etc.)
- Docker installed
- SSL certificate (Let's Encrypt)

#### Steps

1. Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

2. Create `.dockerignore`:

```
node_modules
.git
.env.local
.env.*.local
dist
```

3. Build image:

```bash
docker build -t orinoko-appsaas .
```

4. Run container:

```bash
docker run -p 3000:3000 \
  -e VITE_SUPABASE_URL=... \
  -e VITE_SUPABASE_KEY=... \
  orinoko-appsaas
```

5. Set up reverse proxy (Nginx/Apache)
6. Configure SSL with Let's Encrypt

#### Benefits
- Full control over infrastructure
- No vendor lock-in
- Customizable environment

### Option 4: AWS Static Site Hosting

Using AWS S3 + CloudFront:

1. Build project: `npm run build`
2. Upload `dist/` folder to S3 bucket
3. Set up CloudFront distribution
4. Enable SSL
5. Point domain to CloudFront

## Monitoring & Logging

### Development Monitoring
- Browser DevTools (React DevTools, Network tab)
- Supabase Studio dashboard
- Terminal console output

### Production Monitoring (Future)
- Sentry for error tracking
- LogRocket for session replay
- Datadog for performance monitoring
- Supabase built-in metrics

## Environment Configuration

### Development
```env
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_KEY=dev-anon-key
VITE_APP_ENV=development
```

### Staging
```env
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_KEY=staging-anon-key
VITE_APP_ENV=staging
```

### Production
```env
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_KEY=prod-anon-key
VITE_APP_ENV=production
```

## Troubleshooting

### Issue: Dependencies fail to install

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: Can't connect to Supabase

- Verify `VITE_SUPABASE_URL` is correct (should start with https://...)
- Verify `VITE_SUPABASE_KEY` is the anon key (not service role key)
- Check Supabase project is running (green status in dashboard)
- Check browser console for actual error message

### Issue: Database tables not appearing

- Log into Supabase dashboard
- Go to SQL Editor
- Run schema SQL again (safe to re-run, won't duplicate)
- Check for error messages in output

### Issue: Hot Module Replacement (HMR) not working

```bash
# Stop dev server (Ctrl+C)
# Clear Vite cache
rm -rf node_modules/.vite

# Restart dev server
npm run dev
```

### Issue: Build fails with TypeScript errors

```bash
# Check for type errors
npm run type-check

# Fix issues or suppress errors (not recommended)
# Update tsconfig.json
```

### Issue: Port 5173 already in use

```bash
# Use different port
npm run dev -- --port 3000

# Or kill process using the port
lsof -i :5173
kill -9 <PID>
```

## Security Checklist

- [ ] Never commit `.env.local` to Git
- [ ] Use anon key in frontend (not service role key)
- [ ] Enable RLS on all database tables
- [ ] Use Row Level Security policies for multi-tenancy
- [ ] Validate all user inputs
- [ ] Use HTTPS in production
- [ ] Enable Supabase Auth
- [ ] Set up CORS properly
- [ ] Review and test RLS policies
- [ ] Use environment variables for secrets
- [ ] Implement rate limiting (future)
- [ ] Add CSRF protection (future)
- [ ] Encrypt sensitive data (future)
- [ ] Regular security audits

## Performance Optimization

### Development
- Vite provides fast HMR
- TypeScript checking catches errors early
- Development build is not optimized (use for debugging)

### Production Build
- Minification reduces file size by ~60-70%
- Code splitting separates vendor code
- Tree-shaking removes unused code
- Gzip compression ~30-40% smaller on wire

### Runtime Performance
- Lazy load pages with React.lazy()
- Memoize expensive computations
- Debounce/throttle user input
- Paginate large lists
- Cache API responses

## Git Workflow

### Feature Branch Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: Add my feature"

# Push to remote
git push origin feature/my-feature

# Create pull request on GitHub
# After review and approval, merge to main
```

### Commit Message Format
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no functional change)
- `refactor:` Code restructuring
- `test:` Tests
- `chore:` Maintenance, dependencies

## Continuous Integration (CI)

### GitHub Actions (Future)
Set up workflows for:
- Run tests on PR
- Check linting
- Build verification
- Deploy on merge to main

## Backup & Recovery

### Database Backups
- Supabase automatically backs up daily
- Keep weekly backups for 35 days (free tier)
- Download backups from Supabase dashboard

### Code Backups
- Git repository is your backup
- Push regularly to remote
- Use GitHub's branch protection

## Support & Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Community
- React Discord
- Supabase Community Slack
- Stack Overflow tags: react, typescript, supabase

### Getting Help
1. Check documentation
2. Search existing issues
3. Check error messages carefully
4. Ask in community forums
5. Contact team/support

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Set up Supabase project
3. ✅ Run schema SQL
4. ✅ Configure environment variables
5. ✅ Start dev server: `npm run dev`
6. ✅ Create test account and explore features
7. ✅ Run tests: `npm run test`
8. ✅ Build for production: `npm run build`
9. ✅ Deploy to Vercel/Netlify/Self-hosted
10. ✅ Monitor and optimize

## Support Contact

For issues or questions:
- GitHub Issues: [Project Issues](https://github.com/orinokoflowsystems-stack/Orinoko-Local-SEO/issues)
- Email: support@orinoko.app
- Documentation: See DEVELOPMENT.md and ARCHITECTURE.md
