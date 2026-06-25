-- ⚠️  DESTRUCTIVO  ⚠️
-- Borra TODAS las tablas de Everterra Invoicing (datos de la app + autenticación).
-- Úsalo solo cuando quieras reconstruir la base de datos desde cero.
-- El orden no importa porque usamos CASCADE.

DROP TABLE IF EXISTS "invoice_items" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "clients" CASCADE;
DROP TABLE IF EXISTS "company_settings" CASCADE;
DROP TABLE IF EXISTS "verification" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "account" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
