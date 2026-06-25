// ⚠️  Reinicio destructivo de la base de datos  ⚠️
//
// Borra todas las tablas (scripts/reset_schema.sql) y vuelve a crear el esquema
// limpio (scripts/001_init_schema.sql). Pensado para ejecutarse UNA vez, a mano,
// cuando quieras empezar la base de datos desde cero.
//
// Por seguridad NO hace nada a menos que se confirme explícitamente:
//   CONFIRM_DB_RESET=yes node scripts/reset.mjs
// o vía pnpm:
//   CONFIRM_DB_RESET=yes pnpm db:reset
//
// NO está conectado a `pnpm start`, así que un despliegue normal jamás borra datos.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const here = dirname(fileURLToPath(import.meta.url))

if (!process.env.DATABASE_URL) {
  console.error("[reset] DATABASE_URL no está definida — no puedo conectar.")
  process.exit(1)
}

if (process.env.CONFIRM_DB_RESET !== "yes") {
  console.error(
    "[reset] Operación destructiva cancelada.\n" +
      "        Para confirmar, ejecuta:  CONFIRM_DB_RESET=yes pnpm db:reset",
  )
  process.exit(1)
}

const resetSql = readFileSync(join(here, "reset_schema.sql"), "utf8")
const initSql = readFileSync(join(here, "001_init_schema.sql"), "utf8")
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

try {
  console.log("[reset] Borrando tablas existentes…")
  await pool.query(resetSql)
  console.log("[reset] Recreando el esquema limpio…")
  await pool.query(initSql)
  console.log("[reset] Listo. Base de datos reiniciada desde cero.")
} catch (err) {
  console.error("[reset] Falló el reinicio:", err?.message ?? err)
  process.exitCode = 1
} finally {
  await pool.end()
}
