# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential development workflow:**
```bash
# Start development
npm run dev                              # Next.js dev server (http://localhost:3000)

# Code quality
npm run lint                            # ESLint & TypeScript checks
npm run format                          # Prettier formatting
npm run build                           # Production build (run before deployment)

# Database operations
supabase start                          # Start local Supabase stack
supabase stop                           # Stop local stack
supabase db push                        # Apply database migrations
npm run supabase:generate-types         # Generate TypeScript types from database schema

# Local Supabase commands (when available)
supabase start/stop                     # For local development with full Supabase stack
```

**Testing single components:**
```bash
npm run build                           # Always test build after changes
```

## Architecture Overview

**Technology Stack:**
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui components
- **Backend:** Supabase (PostgreSQL + Auth + Storage), with custom database schema
- **Auth:** Supabase Auth with RLS (Row Level Security) policies
- **Styling:** Tailwind CSS with custom asphalt industry theme colors
- **PDF Generation:** @react-pdf/renderer for quotes with Australian GST compliance

**Key Architecture Patterns:**
- **Multi-tenant SaaS:** Database schema uses `app.tenants` table with RLS policies for data isolation
- **Feature-based organization:** Code organized by business domain (`features/job-scoping/`, `features/pdf/`)
- **Server/Client separation:** Uses Next.js App Router with separate Supabase clients for server and browser contexts
- **Australian business compliance:** Built-in ABN validation, GST calculations, and Australian state/territory handling

**Database Schema:**
- **Schema:** All app tables in `app` schema (not `public`)
- **Multi-tenancy:** Row Level Security enforced via `tenant_id` columns
- **Industry-specific:** Asphalt job types, Australian compliance fields (ABN, GST), equipment tracking
- **Generated types:** Database types auto-generated in `lib/database.types.ts`

**File Organization:**
```
app/                    # Next.js App Router pages and API routes
├── (auth)/            # Authentication pages (login, register)
├── dashboard/         # Protected application pages
└── api/               # Server-side API routes

components/            # Reusable UI components
├── dashboard/         # Dashboard-specific components
└── ui/               # shadcn/ui component library

features/              # Business domain modules
├── job-scoping/       # Multi-step job creation forms
└── pdf/              # Quote PDF generation

lib/                   # Shared utilities and configurations
├── supabase.ts        # Supabase client configurations (server, browser, admin)
├── database.types.ts  # Auto-generated database types
└── utils.ts          # Utility functions

db/migrations/         # Supabase database migrations
```

**Important Implementation Details:**
- **Supabase clients:** Use `createClient()` for server-side, `getBrowserClient()` for client-side operations
- **Australian compliance:** ABN validation and GST calculations built into `lib/supabase.ts`
- **Styling:** Custom asphalt theme colors defined in `tailwind.config.js` with industry-specific color palette
- **Environment setup:** Requires both local Supabase instance OR remote Supabase project with proper environment variables
- **Path aliases:** TypeScript paths configured for `@/`, `@components/`, `@features/`, `@lib/`, `@app/`, `@db/`

**Database Migrations:**
- Use `supabase migration new <name>` to create new migrations
- Apply with `supabase db push`
- Always regenerate types after schema changes: `npm run supabase:generate-types`