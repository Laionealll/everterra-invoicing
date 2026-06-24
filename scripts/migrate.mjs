// Idempotent schema bootstrap.
//
// Runs scripts/001_init_schema.sql against DATABASE_URL so the database is
// provisioned automatically on every deploy — no manual psql step needed.
// Every statement uses CREATE TABLE IF NOT EXISTS / ON CONFLICT DO NOTHING,
// so re-running it on an already-initialized database is a no-op.
//
// Wired into `pnpm start` (start = "node scripts/migrate.mjs && next start"),
// and also runnable on its own with `pnpm db:migrate`.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const here = dirname(fileURLToPath(import.meta.url))

if (!process.env.DATABASE_URL) {
  console.error("[migrate] DATABASE_URL is not set — cannot apply schema.")
  process.exit(1)
}

const sql = readFileSync(join(here, "001_init_schema.sql"), "utf8")
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

try {
  await pool.query(sql)
  console.log("[migrate] Schema is up to date.")
} catch (err) {
  console.error("[migrate] Failed to apply schema:", err?.message ?? err)
  // Exit non-zero so `&& next start` does not boot the app against a broken DB.
  process.exitCode = 1
} finally {
  await pool.end()
}
