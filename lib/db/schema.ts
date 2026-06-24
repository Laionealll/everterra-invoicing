import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  numeric,
} from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.
// `role` and `isActive` are app-specific additions surfaced via Better Auth's
// additionalFields config.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("USER"), // ADMIN | USER
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Everterra is a single small business: clients and invoices are company-wide
// (visible to all authenticated staff). We still record createdById for
// attribution. Settings and user management are ADMIN-only at the app layer.

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contactName"),
  email: text("email"),
  phone: text("phone"),
  addressLine1: text("addressLine1").notNull().default(""),
  addressLine2: text("addressLine2"),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  zip: text("zip").notNull().default(""),
  country: text("country").notNull().default("USA"),
  notes: text("notes"),
  createdById: text("createdById"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

// Single-row table (id = 1) holding company-wide settings.
export const companySettings = pgTable("company_settings", {
  id: integer("id").primaryKey().default(1),
  legalName: text("legalName").notNull().default("Everterra LLC"),
  registeredAddress: text("registeredAddress")
    .notNull()
    .default("418 Broadway, Ste N, Albany, NY 12207"),
  operations: text("operations")
    .notNull()
    .default("Hunts Point Produce Market, Bronx, New York"),
  phone: text("phone").notNull().default("732-558-2983"),
  email: text("email").notNull().default("everterrallc@gmail.com"),
  tagline: text("tagline").notNull().default("GLOBAL QUALITY & FRESHNESS"),
  logoPath: text("logoPath").notNull().default("/everterra-logo.png"),
  // Payment / banking
  zelleEmail: text("zelleEmail").notNull().default("everterrallc@gmail.com"),
  bankName: text("bankName").notNull().default(""),
  accountNumber: text("accountNumber").notNull().default(""),
  routingNumber: text("routingNumber").notNull().default(""),
  acceptedMethods: text("acceptedMethods")
    .notNull()
    .default("Zelle, Bank Transfer, Check"),
  // Defaults applied to new invoices
  defaultNotes: text("defaultNotes")
    .notNull()
    .default(
      "USDA/Federal inspection on arrival. Condition issues must be reported within 48 hours. Payment due upon arrival & inspection. Governed by standard PACA trade terms. Title remains with Everterra LLC until paid in full.",
    ),
  defaultPaymentTerms: text("defaultPaymentTerms")
    .notNull()
    .default("Payment due upon arrival & inspection."),
  defaultSignatoryName: text("defaultSignatoryName")
    .notNull()
    .default("Ramón Rodríguez"),
  defaultSignatoryTitle: text("defaultSignatoryTitle")
    .notNull()
    .default("Chief Manager"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoiceNumber").notNull().unique(),
  clientId: integer("clientId").notNull(),
  issueDate: timestamp("issueDate").notNull().defaultNow(),
  dueDate: timestamp("dueDate").notNull().defaultNow(),
  status: text("status").notNull().default("DRAFT"), // DRAFT|SENT|PAID|OVERDUE|CANCELLED
  currency: text("currency").notNull().default("USD"),
  taxRate: numeric("taxRate", { precision: 6, scale: 3 }).notNull().default("0"),
  notes: text("notes").notNull().default(""),
  paymentTerms: text("paymentTerms").notNull().default(""),
  signatoryName: text("signatoryName").notNull().default("Ramón Rodríguez"),
  signatoryTitle: text("signatoryTitle").notNull().default("Chief Manager"),
  subtotal: numeric("subtotal", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  taxAmount: numeric("taxAmount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  total: numeric("total", { precision: 14, scale: 2 }).notNull().default("0"),
  createdById: text("createdById"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoiceId").notNull(),
  product: text("product").notNull().default(""),
  origin: text("origin"),
  quality: text("quality"),
  quantity: text("quantity").notNull().default(""), // free text, e.g. "200 Sacks"
  qty: numeric("qty", { precision: 14, scale: 3 }).notNull().default("0"), // numeric for math
  unitPrice: numeric("unitPrice", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  sortOrder: integer("sortOrder").notNull().default(0),
})
