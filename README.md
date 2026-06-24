# Everterra Invoicing

Internal invoicing portal for Everterra LLC. Next.js 16 (App Router) · Postgres ·
Drizzle ORM · Better Auth · `@react-pdf/renderer` · Tailwind v4 · base-ui.

## Local development

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL and BETTER_AUTH_SECRET
pnpm db:migrate        # create the tables (idempotent)
pnpm dev               # http://localhost:3000
```

The first time you open the app with an empty database, `/` → `/login` → `/setup`,
where you create the first **ADMIN** account. After that, sign in at `/login`.

## Deploy to Railway

1. **Database** — add the **Postgres** plugin (gives you `DATABASE_URL` automatically),
   or paste a Neon connection string.
2. **Variables** (Settings → Variables):
   - `DATABASE_URL` — Postgres connection string (Neon needs `?sslmode=require`).
     With the Railway plugin, reference it as `${{ Postgres.DATABASE_URL }}`.
   - `BETTER_AUTH_SECRET` — random string ≥ 32 chars (`openssl rand -base64 32`).
   - `BETTER_AUTH_URL` — the public URL, e.g. `https://your-app.up.railway.app`.
   - *(optional)* `RESEND_API_KEY`, `EMAIL_FROM` — to actually send emails.
3. **Deploy.** Railway (Nixpacks) runs `pnpm install` → `pnpm build` → `pnpm start`.
   On start, `scripts/migrate.mjs` applies the schema automatically before the
   server boots — **no manual SQL step required.** The migration is idempotent, so
   it safely re-runs on every deploy.
4. Open the app → `/setup` → create the admin → done.

> Node 20+ is required (declared in `package.json` → `engines`).

## Database schema

`scripts/001_init_schema.sql` is the single source of truth for the schema and
matches the Drizzle definitions in `lib/db/schema.ts`. `scripts/migrate.mjs` runs
it; you can also apply it manually with:

```bash
psql "$DATABASE_URL" -f scripts/001_init_schema.sql
```
