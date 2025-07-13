# Getting Started with **Viable**

Welcome to the Viable code-base — a mobile-first SaaS platform that helps Australian asphalt contractors streamline quoting, scheduling and compliance.

This guide explains:
1. What’s in the MVP you just checked out  
2. How to get a local dev environment running  
3. Next steps & tips for productive development  

---

## 1. What’s Inside the MVP?

Feature highlights you can already play with:

| Area | Included in MVP |
|------|-----------------|
| Auth & multi-tenant scaffold | ✅ Supabase Auth helpers & RLS policies |
| Database schema | ✅ PostgreSQL (Supabase) with 50+ tables, enums & triggers for Australian specifics (GST, ABN) |
| UI stack | ✅ Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui |
| Global styling | ✅ Light/Dark themes, mobile 44 px touch targets |
| Job Scoping | ✅ Basic-info & Area steps (tonnage calc with 5 % waste) |
| Scheduling | ✅ Calendar shell & upcoming-jobs widget |
| Customers CRUD | ✅ Fetch & select inside job form |
| Quote PDF | ✅ React-PDF template with AU GST & acceptance signatures |
| Compliance | ✅ DB tables for SWMS, QA, Chain-of-Responsibility |
| Dev Tooling | ✅ ESLint, Prettier, Husky, lint-staged |

---

## 2. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | **≥ 18** | Needed for Next.js 14 |
| npm / pnpm / yarn | Latest | `npm` scripts in repo |
| Supabase CLI | **≥ 1.110** | `brew install supabase/tap/supabase` |
| Git | any | Conventional commits preferred |
| Mapbox token | free account | for interactive site map |
| (Optional) BOM API key | free | extended weather |

---

## 3. First-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/your-org/viable.git
cd viable

# 2. Install JS deps
npm install     # or pnpm install

# 3. Copy env template & fill values
cp .env.example .env.local
# edit .env.local in your editor

# 4. Start local Supabase (Postgres + auth + storage)
supabase start

# 5. Push DB schema & seed data
supabase db push         # applies db/migrations/**

# 6. Generate typed DB definitions (optional but recommended)
npm run supabase:generate-types

# 7. Run Next.js dev server
npm run dev

# 8. Open the app
open http://localhost:3000
```

Login/Register flows will hit the **local** Supabase instance.  
Default seed credentials:

```
email: admin@viable-saas.com.au
password: Viable123!
```

---

## 4. Project Structure Cheatsheet

```
.
├── app/                # Next.js routes (App Router)
│   ├── (auth)/         # Login / Register / Reset
│   ├── dashboard/      # Protected shell & pages
│   └── api/            # Route handlers (Server Actions)
├── components/         # Reusable UI bits & icons
├── features/           # Domain modules
│   ├── job-scoping/    # Multi-step form
│   ├── customers/
│   ├── scheduling/
│   └── pdf/
├── lib/                # Supabase client, utils, hooks
├── db/                 # SQL migrations & seeds
├── public/             # Static assets (logo, fonts)
└── scripts/            # CLI helpers (e.g. pdf build)
```

---

## 5. Useful Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Next.js with hot-reload |
| `npm run build` | Production build |
| `npm run lint` | ESLint & Type checks |
| `npm run format` | Prettier write |
| `supabase db push` | Apply latest migrations |
| `supabase start/stop` | Manage local stack |
| `npm run supabase:generate-types` | Regenerate typed DB helpers |

---

## 6. Deploying to Vercel

1. Create a new Vercel project → import Git repo  
2. Add env vars from `.env.local` (don’t commit secrets)  
3. Set `SUPABASE_SERVICE_ROLE_KEY` as a **private** env (Server only)  
4. Build command: `npm run build` — Output: `/.next`  
5. Enable Postgres connection pooler (optional for prod)  

---

## 7. Development Workflow

1. **Feature branch** → Conventional Commit messages (`feat: job scoping step 3`).  
2. **Supabase migrations**:  
   ```bash
   supabase migration new add_quality_table
   # edit SQL file, then
   supabase db push
   ```  
3. **Husky** hooks run lint/format on commit.  
4. PR → Code review → merge to `develop` → auto-deploy preview on Vercel.  
5. Tag & promote to `main` for production.

---

## 8. Where to Go Next

☑️ Finish remaining Job-Scoping steps (Materials, Hazards, Equipment).  
☑️ Add drag-and-drop scheduling UI with FullCalendar.  
☑️ Implement offline PWA caching for field use.  
☑️ Integrate BOM weather API for live paving windows.  
☑️ Build Xero / MYOB webhooks for invoicing.  
☑️ Write Vitest unit tests & Playwright e2e.  

Feel free to raise issues or PRs — **happy paving!**
