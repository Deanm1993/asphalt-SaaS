# Viable – Asphalt SaaS Platform

Mobile-first SaaS for Australian asphalt contractors.  
Built with **Next.js 14 + TypeScript, Tailwind CSS (shadcn/ui)** on the front-end and **Supabase (Postgres + Auth)** on the back-end.

---

## 1. Quick Start (Local)

```bash
git clone https://github.com/your-org/viable-saas.git
cd viable-saas

# Install Node deps
npm install

# Copy env template and fill values
cp .env.example .env.local
# ↳ add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
# ↳ add SUPABASE_SERVICE_ROLE_KEY  (⚠️ server-only)

# Start dev server
npm run dev      # http://localhost:3000
```

---

## 2. Supabase Database & Schema

### 2.1 Required Keys

| key | where to find | purpose |
|-----|---------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | dashboard → Settings → API | client URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page | browser auth / RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** key on API page | admin tasks (migrations, seeds) |

> Never expose the service role key to the browser or commit it to git.

### 2.2 Apply the Schema (two options)

#### A) Script (Node + pg) – works on most hosts

```bash
# install pg + dotenv the first time
npm install pg dotenv

# run script (forces IPv4 to avoid ENETUNREACH)
node scripts/apply-schema-pg.js
```

The script:
* Forces IPv4 DNS lookup (fixes `ENETUNREACH` seen on some VPS/VMs).
* Splits `db/migrations/01_initial_schema.sql` into statements inside a transaction.
* Inserts a bootstrap `auth.users` row so the FK on `app.users(id)` succeeds (avoids error 23503).

If you hit `ENOTFOUND db.<ref>.supabase.co`, your VM DNS cannot resolve the Postgres host.  
 ➟ Use option B instead.

#### B) Supabase SQL Editor – guaranteed to work

1. Dashboard → **SQL Editor** → New Query  
2. Paste contents of `scripts/fix-schema.sql` (adds the bootstrap auth row, then full schema).  
3. Run.

---

## 3. Fixing Missing UI Components (Build Errors)

Running `npm run build` before the UI library is complete produces:

```
Module not found: '@/components/ui/label' …
```

Viable ships only the shadcn primitives you actually need.  
Create / verify these files:

```
components/ui/
 ├─ label.tsx
 ├─ checkbox.tsx
 ├─ card.tsx
 ├─ tabs.tsx
 ├─ separator.tsx
 ├─ select.tsx
 ├─ alert.tsx
 ├─ breadcrumb.tsx
 └─ dropdown-menu.tsx
features/job-scoping/job-site-form.tsx
```

> All of these components are included in the repo under *components/ui* and *features/*; if you cloned before they were added simply `git pull` to update.

Install runtime deps once:

```bash
npm install \
  @radix-ui/react-label \
  @radix-ui/react-checkbox \
  @radix-ui/react-tabs \
  @radix-ui/react-separator \
  @radix-ui/react-select \
  @radix-ui/react-dropdown-menu \
  class-variance-authority lucide-react
```

Re-build:

```bash
npm run build
```

---

## 4. Production Deployment (VM)

### 4.1 PM2

```bash
# build & serve
npm run build
pm2 start npm --name viable-saas -- start
pm2 save
pm2 startup        # optional boot autostart
```

### 4.2 Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name <YOUR_VM_IP>;   # or domain
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo apt install nginx
sudo tee /etc/nginx/sites-available/viable-saas  # paste config
sudo ln -s /etc/nginx/sites-available/viable-saas /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

Add Let’s Encrypt (`sudo certbot --nginx`) for HTTPS.

---

## 5. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `ENETUNREACH 2406:…` when running schema script | VM only has IPv6 route → use `apply-schema-pg.js` which forces IPv4, or run through SQL Editor. |
| `ENOTFOUND db.<ref>.supabase.co` | DNS blocked – run schema via SQL Editor or add DNS servers (1.1.1.1, 8.8.8.8) to VM. |
| `23503 users_id_fkey` | Ensure bootstrap row in `auth.users` exists (included in `fix-schema.sql`). |
| `Module not found '@/components/ui/*'` | Pull latest repo or create missing shadcn/ui files, then `npm install` required Radix packages. |

---

## 6. What Next?

* See `GETTING_STARTED.md` for feature walk-through and roadmap.
* Open issues or PRs – contributions welcome!

Happy paving 🚧
