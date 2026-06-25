"use server"

import { db } from "@/lib/db"
import { clients, companySettings, invoiceItems, invoices } from "@/lib/db/schema"
import { computeTotals, type LineItemInput } from "@/lib/calc"
import { requireUser } from "@/lib/session"
import { and, desc, eq, like, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type InvoiceItemInput = {
  product: string
  origin?: string
  quality?: string
  quantity: string
  qty: number
  unitPrice: number
}

export type InvoiceInput = {
  clientId: number
  issueDate: string
  dueDate: string
  status?: string
  taxRate: number
  notes: string
  paymentTerms: string
  signatoryName: string
  signatoryTitle: string
  receivedByName: string
  receivedByCompany: string
  items: InvoiceItemInput[]
}

export async function getInvoices() {
  await requireUser()
  const rows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      total: invoices.total,
      clientName: clients.name,
      clientId: clients.id,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .orderBy(desc(invoices.createdAt))
  return rows
}

export async function getInvoiceStats() {
  await requireUser()
  const rows = await db
    .select({ status: invoices.status, total: invoices.total })
    .from(invoices)
  let outstanding = 0
  let paid = 0
  let draft = 0
  let count = 0
  for (const r of rows) {
    count++
    const t = Number(r.total)
    if (r.status === "PAID") paid += t
    else if (r.status === "DRAFT") draft += t
    else if (r.status === "SENT" || r.status === "OVERDUE") outstanding += t
  }
  return { outstanding, paid, draft, count }
}

export async function getInvoice(id: number) {
  await requireUser()
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id))
  if (!invoice) return null
  const [client] = await db.select().from(clients).where(eq(clients.id, invoice.clientId))
  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, id))
    .orderBy(invoiceItems.sortOrder)
  return { invoice, client: client ?? null, items }
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `EVT-${year}-`
  const [last] = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(like(invoices.invoiceNumber, `${prefix}%`))
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1)
  let next = 1
  if (last?.invoiceNumber) {
    const tail = Number.parseInt(last.invoiceNumber.slice(prefix.length), 10)
    if (Number.isFinite(tail)) next = tail + 1
  }
  return `${prefix}${String(next).padStart(4, "0")}`
}

export async function createInvoice(input: InvoiceInput) {
  const user = await requireUser()
  if (!input.clientId) throw new Error("Please select a client")
  if (!input.items.length) throw new Error("Add at least one line item")

  const totals = computeTotals(input.items as LineItemInput[], input.taxRate)
  const invoiceNumber = await generateInvoiceNumber()

  const [invoice] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      clientId: input.clientId,
      issueDate: new Date(input.issueDate),
      dueDate: new Date(input.dueDate),
      status: input.status === "SENT" ? "SENT" : "DRAFT",
      taxRate: String(input.taxRate),
      notes: input.notes,
      paymentTerms: input.paymentTerms,
      signatoryName: input.signatoryName,
      signatoryTitle: input.signatoryTitle,
      receivedByName: input.receivedByName,
      receivedByCompany: input.receivedByCompany,
      subtotal: String(totals.subtotal),
      taxAmount: String(totals.taxAmount),
      total: String(totals.total),
      createdById: user.id,
      sentAt: input.status === "SENT" ? new Date() : null,
    })
    .returning()

  await insertItems(invoice.id, input.items, totals.lineAmounts)
  revalidatePath("/invoices")
  revalidatePath("/dashboard")
  return invoice
}

export async function updateInvoice(id: number, input: InvoiceInput) {
  await requireUser()
  if (!input.clientId) throw new Error("Please select a client")
  if (!input.items.length) throw new Error("Add at least one line item")

  const totals = computeTotals(input.items as LineItemInput[], input.taxRate)

  await db
    .update(invoices)
    .set({
      clientId: input.clientId,
      issueDate: new Date(input.issueDate),
      dueDate: new Date(input.dueDate),
      taxRate: String(input.taxRate),
      notes: input.notes,
      paymentTerms: input.paymentTerms,
      signatoryName: input.signatoryName,
      signatoryTitle: input.signatoryTitle,
      receivedByName: input.receivedByName,
      receivedByCompany: input.receivedByCompany,
      subtotal: String(totals.subtotal),
      taxAmount: String(totals.taxAmount),
      total: String(totals.total),
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))

  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id))
  await insertItems(id, input.items, totals.lineAmounts)

  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  revalidatePath("/dashboard")
}

async function insertItems(invoiceId: number, items: InvoiceItemInput[], amounts: number[]) {
  await db.insert(invoiceItems).values(
    items.map((it, i) => ({
      invoiceId,
      product: it.product,
      origin: it.origin || null,
      quality: it.quality || null,
      quantity: it.quantity || "",
      qty: String(it.qty || 0),
      unitPrice: String(it.unitPrice || 0),
      amount: String(amounts[i] ?? 0),
      sortOrder: i,
    })),
  )
}

export async function setInvoiceStatus(id: number, status: string) {
  await requireUser()
  const valid = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]
  if (!valid.includes(status)) throw new Error("Invalid status")
  await db
    .update(invoices)
    .set({
      status,
      sentAt: status === "SENT" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))
  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  revalidatePath("/dashboard")
}

export async function deleteInvoice(id: number) {
  await requireUser()
  await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id))
  await db.delete(invoices).where(eq(invoices.id, id))
  revalidatePath("/invoices")
  revalidatePath("/dashboard")
}

export async function sendInvoice(id: number) {
  await requireUser()
  const data = await getInvoice(id)
  if (!data?.invoice) throw new Error("Invoice not found")
  const to = data.client?.email
  const { sendInvoiceEmail, emailConfigured } = await import("@/lib/email")
  let emailed = false
  if (to) {
    // Genera el PDF y adjúntalo, para que el correo cumpla con el
    // "Please find attached invoice…" del mensaje. Las respuestas del cliente
    // van al correo de la empresa (replyTo).
    const { getSettings } = await import("@/app/actions/settings")
    const { renderInvoicePdf } = await import("@/lib/pdf/render-invoice")
    const company = await getSettings()
    let pdf: Buffer | undefined
    try {
      pdf = await renderInvoicePdf({
        invoice: data.invoice,
        client: data.client,
        items: data.items,
        company,
      })
    } catch (err) {
      console.error("[everterra] Could not render invoice PDF for email:", err)
    }
    const res = await sendInvoiceEmail({
      to,
      invoiceNumber: data.invoice.invoiceNumber,
      total: data.invoice.total,
      pdf,
      replyTo: company.email || undefined,
    })
    emailed = res.sent
  }
  await db
    .update(invoices)
    .set({ status: "SENT", sentAt: new Date(), updatedAt: new Date() })
    .where(eq(invoices.id, id))
  revalidatePath("/invoices")
  revalidatePath(`/invoices/${id}`)
  revalidatePath("/dashboard")
  return { emailed, configured: emailConfigured(), to: to ?? null }
}
