# Viable – SaaS for Australian Asphalt Contractors

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

Viable is a mobile-first, multi-tenant platform that helps Australian asphalt contractors (5-30 employees) streamline quoting, scheduling, and site compliance.  
The goal: **save 10 + hours of admin each week and cut quote errors by 90 %**.

---

## ✨ Key MVP Features

| Module | Highlights |
|--------|------------|
| Job Scoping | Multi-step form with interactive map, automatic tonnage & material calculations (incl. 5 % waste), ABN validation, GST 10 % handling |
| Customer Management | CRUD for clients, repeat-job templates, contact sync |
| Scheduling | Drag-and-drop calendar, crew colour-coding, basic weather overlay (BOM) |
| Quote PDF | Branded PDF generation with line-item breakdown & compliance notes |

---

## 🔧 Tech Stack

• **Frontend**: Next.js 14 (App Router) + TypeScript  
• **UI**: Tailwind CSS, [shadcn/ui](https://ui.shadcn.com)  
• **Backend**: Supabase  
 • PostgreSQL for data  
 • Supabase Auth (email/password, magic-link)  
 • Edge Functions (future)  
• **Storage**: Supabase Storage (site photos, PDFs)  
• **Deployment**: Vercel (or self-host via Docker)  
• **PDFs**: `react-pdf` (client) + server-side render in Edge Function  
• **Maps**: Mapbox GL JS  
• **Weather**: Bureau of Meteorology (BOM) API integration  

---

## 🖥️ Prerequisites

1. **Node.js ≥ 18** and npm (or pnpm/yarn)  
2. **Supabase account** & `supabase` CLI  
3. Mapbox access token  
4. (Optional) BOM API key for extended forecast

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/your-org/viable.git
cd viable

# 2. Install
npm install

# 3. Configure environment
cp .env.example .env.local
# then add SUPABASE_URL, SUPABASE_ANON_KEY, MAPBOX_TOKEN, etc.

# 4. Start Supabase locally
supabase start

# 5. Push database schema
supabase db push

# 6. Run dev server
npm run dev
```

Open `http://localhost:3000` – you should see the Viable landing page and be able to register a tenant.

---

## 📂 Project Structure

```
.
├── app/                 # Next.js route handlers & pages
│   ├── (auth)/          # Login / Register / Reset
│   ├── dashboard/       # Auth-protected shell
│   └── api/             # Route handlers (Server Actions)
├── components/          # Re-usable UI components
├── features/
│   ├── job-scoping/
│   ├── customers/
│   ├── scheduling/
│   └── pdf/
├── lib/                 # Helpers (validation, calc, supabase-client)
├── db/                  # Supabase migrations & seeders
├── scripts/             # Utility scripts (e.g. PDF build)
├── tailwind.config.ts
└── supabase/            # Local dev config
```

---

## 🏛️ Database Schema (excerpt)

| Table | Purpose |
|-------|---------|
| `tenants` | Multi-tenant separation (row level security) |
| `users`   | Auth users (Supabase) + role (`admin`, `crew`) |
| `customers` | Client businesses & contacts |
| `jobs` | Core job record; status enum (`quoted`,`scheduled`,`in_progress`,`complete`) |
| `job_items` | Area/depth/mix lines associated with a job |
| `schedules` | Calendar entries incl. crew id & start/end |

See `db/migrations/*` for full DDL.

---

## 💰 Australian Specifics

• **GST**: All prices include 10 % GST by default; utilities in `lib/gst.ts`  
• **ABN Validation**: Server action query to ABR API (`abr.business.gov.au/json/AbnDetails`)  
• **TPAR**: Year-end contractor payments report endpoint (planned)  
• **State Specs**: NSW RMS, VIC DoT, etc. stored in `reference_specifications` table

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js with hot-reload |
| `npm run build` | Production build |
| `npm run lint` | ESLint + TypeScript checks |
| `npm run format` | Prettier write |
| `supabase db push` | Apply latest migrations |
| `supabase functions serve` | Run Edge Functions locally |

---

## 🧭 Development Guidelines

1. **Git Flow**  
   • `main` = prod, `develop` = integration, feature branches PR → develop  
2. **Code Style**  
   • ESLint + Prettier enforced (run pre-commit)  
3. **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`)  
4. **Database**  
   • Never edit SQL directly in prod; create migration via Supabase CLI  
5. **Testing**  
   • Unit tests with Vitest, e2e coming (Playwright)  
6. **Secrets**  
   • Use `.env.local`, never commit keys  

---

## 📅 Roadmap

- Traffic control integration & resource planning  
- Live temperature monitoring via Bluetooth probe  
- Offline Progressive Web App (PWA) caching  
- Xero / MYOB accounting sync  
- Concrete & civil works modules  

---

## 🤝 Contributing

Pull requests are welcome! Please open an issue first to discuss changes.

1. Fork → Feature branch → PR to `develop`  
2. Ensure `npm run lint` and tests pass  
3. Describe the problem & solution clearly

---

## 📜 License

MIT © 2025 Viable Pty Ltd
