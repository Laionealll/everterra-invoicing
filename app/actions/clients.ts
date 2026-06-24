"use server"

import { db } from "@/lib/db"
import { clients, invoices } from "@/lib/db/schema"
import { requireUser } from "@/lib/session"
import { and, desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type ClientInput = {
  name: string
  contactName?: string
  email?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  notes?: string
}

export async function getClients() {
  await requireUser()
  return db.select().from(clients).orderBy(desc(clients.createdAt))
}

export async function getClientsWithCounts() {
  await requireUser()
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      contactName: clients.contactName,
      email: clients.email,
      phone: clients.phone,
      addressLine1: clients.addressLine1,
      addressLine2: clients.addressLine2,
      city: clients.city,
      state: clients.state,
      zip: clients.zip,
      country: clients.country,
      notes: clients.notes,
      invoiceCount: sql<number>`count(${invoices.id})::int`,
    })
    .from(clients)
    .leftJoin(invoices, eq(invoices.clientId, clients.id))
    .groupBy(clients.id)
    .orderBy(desc(clients.createdAt))
  return rows
}

export async function getClientOptions() {
  await requireUser()
  return db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .orderBy(clients.name)
}

export async function getClient(id: number) {
  await requireUser()
  const [row] = await db.select().from(clients).where(eq(clients.id, id))
  return row ?? null
}

export async function createClient(input: ClientInput) {
  const user = await requireUser()
  if (!input.name?.trim()) throw new Error("Client name is required")
  const [row] = await db
    .insert(clients)
    .values({
      name: input.name.trim(),
      contactName: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      addressLine1: input.addressLine1 || "",
      addressLine2: input.addressLine2 || null,
      city: input.city || "",
      state: input.state || "",
      zip: input.zip || "",
      country: input.country || "USA",
      notes: input.notes || null,
      createdById: user.id,
    })
    .returning()
  revalidatePath("/clients")
  return row
}

export async function updateClient(id: number, input: ClientInput) {
  await requireUser()
  if (!input.name?.trim()) throw new Error("Client name is required")
  await db
    .update(clients)
    .set({
      name: input.name.trim(),
      contactName: input.contactName || null,
      email: input.email || null,
      phone: input.phone || null,
      addressLine1: input.addressLine1 || "",
      addressLine2: input.addressLine2 || null,
      city: input.city || "",
      state: input.state || "",
      zip: input.zip || "",
      country: input.country || "USA",
      notes: input.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id))
  revalidatePath("/clients")
  revalidatePath(`/clients/${id}`)
}

export async function deleteClient(id: number) {
  await requireUser()
  const [existing] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(invoices)
    .where(eq(invoices.clientId, id))
  if (existing && existing.count > 0) {
    throw new Error("Cannot delete a client that has invoices. Delete or reassign the invoices first.")
  }
  await db.delete(clients).where(eq(clients.id, id))
  revalidatePath("/clients")
}
