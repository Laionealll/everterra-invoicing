-- Everterra Invoicing — esquema inicial completo.
-- Ejecutar UNA vez contra la base de datos de producción.
-- Compatible con Postgres (Neon, Railway Postgres, etc.).

-- ─────────────────────────────────────────────
-- Tablas de Better Auth (NO renombrar columnas)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "role" text NOT NULL DEFAULT 'USER',
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- Tablas de la aplicación
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "clients" (
  "id" serial PRIMARY KEY,
  "name" text NOT NULL,
  "contactName" text,
  "email" text,
  "phone" text,
  "addressLine1" text NOT NULL DEFAULT '',
  "addressLine2" text,
  "city" text NOT NULL DEFAULT '',
  "state" text NOT NULL DEFAULT '',
  "zip" text NOT NULL DEFAULT '',
  "country" text NOT NULL DEFAULT 'USA',
  "notes" text,
  "createdById" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "company_settings" (
  "id" integer PRIMARY KEY DEFAULT 1,
  "legalName" text NOT NULL DEFAULT 'Everterra LLC',
  "registeredAddress" text NOT NULL DEFAULT '418 Broadway, Ste N, Albany, NY 12207',
  "operations" text NOT NULL DEFAULT 'Hunts Point Produce Market, Bronx, New York',
  "phone" text NOT NULL DEFAULT '732-558-2983',
  "email" text NOT NULL DEFAULT 'everterrallc@gmail.com',
  "tagline" text NOT NULL DEFAULT 'GLOBAL QUALITY & FRESHNESS',
  "logoPath" text NOT NULL DEFAULT '/everterra-logo.png',
  "zelleEmail" text NOT NULL DEFAULT 'everterrallc@gmail.com',
  "bankName" text NOT NULL DEFAULT '',
  "accountNumber" text NOT NULL DEFAULT '',
  "routingNumber" text NOT NULL DEFAULT '',
  "acceptedMethods" text NOT NULL DEFAULT 'Zelle, Bank Transfer, Check',
  "defaultNotes" text NOT NULL DEFAULT 'USDA/Federal inspection on arrival. Condition issues must be reported within 48 hours. Payment due upon arrival & inspection. Governed by standard PACA trade terms. Title remains with Everterra LLC until paid in full.',
  "defaultPaymentTerms" text NOT NULL DEFAULT 'Payment due upon arrival & inspection.',
  "defaultSignatoryName" text NOT NULL DEFAULT 'Ramón Rodríguez',
  "defaultSignatoryTitle" text NOT NULL DEFAULT 'Chief Manager',
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "invoices" (
  "id" serial PRIMARY KEY,
  "invoiceNumber" text NOT NULL UNIQUE,
  "clientId" integer NOT NULL,
  "issueDate" timestamp NOT NULL DEFAULT now(),
  "dueDate" timestamp NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'DRAFT',
  "currency" text NOT NULL DEFAULT 'USD',
  "taxRate" numeric(6,3) NOT NULL DEFAULT 0,
  "notes" text NOT NULL DEFAULT '',
  "paymentTerms" text NOT NULL DEFAULT '',
  "signatoryName" text NOT NULL DEFAULT 'Ramón Rodríguez',
  "signatoryTitle" text NOT NULL DEFAULT 'Chief Manager',
  "subtotal" numeric(14,2) NOT NULL DEFAULT 0,
  "taxAmount" numeric(14,2) NOT NULL DEFAULT 0,
  "total" numeric(14,2) NOT NULL DEFAULT 0,
  "createdById" text,
  "sentAt" timestamp,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "invoice_items" (
  "id" serial PRIMARY KEY,
  "invoiceId" integer NOT NULL,
  "product" text NOT NULL DEFAULT '',
  "origin" text,
  "quality" text,
  "quantity" text NOT NULL DEFAULT '',
  "qty" numeric(14,3) NOT NULL DEFAULT 0,
  "unitPrice" numeric(14,2) NOT NULL DEFAULT 0,
  "amount" numeric(14,2) NOT NULL DEFAULT 0,
  "sortOrder" integer NOT NULL DEFAULT 0
);

-- Fila única de configuración de la empresa.
INSERT INTO "company_settings" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;
