"use server"

import { db } from "@/lib/db"
import { companySettings } from "@/lib/db/schema"
import { requireAdmin, requireUser } from "@/lib/session"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getSettings() {
  await requireUser()
  const [row] = await db.select().from(companySettings).where(eq(companySettings.id, 1))
  if (row) return row
  const [created] = await db.insert(companySettings).values({ id: 1 }).returning()
  return created
}

export type SettingsInput = {
  legalName: string
  registeredAddress: string
  operations: string
  phone: string
  email: string
  tagline: string
  zelleEmail: string
  bankName: string
  accountNumber: string
  routingNumber: string
  acceptedMethods: string
  defaultNotes: string
  defaultPaymentTerms: string
  defaultSignatoryName: string
  defaultSignatoryTitle: string
}

export async function updateSettings(input: SettingsInput) {
  await requireAdmin()
  await db
    .update(companySettings)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(companySettings.id, 1))
  revalidatePath("/settings")
  revalidatePath("/invoices")
}
