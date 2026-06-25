// Genera el PDF de una factura como Buffer. Compartido por la ruta de descarga
// (app/api/invoices/[id]/pdf) y por el envío de factura por correo
// (sendInvoice en app/actions/invoices.ts), para no duplicar el mapeo ni la
// carga del logo.

import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer } from "@react-pdf/renderer"
import type { InferSelectModel } from "drizzle-orm"
import { clients, companySettings, invoiceItems, invoices } from "@/lib/db/schema"
import { InvoicePdf } from "@/lib/pdf/invoice-pdf"

type InvoiceRow = InferSelectModel<typeof invoices>
type ClientRow = InferSelectModel<typeof clients>
type ItemRow = InferSelectModel<typeof invoiceItems>
type CompanyRow = InferSelectModel<typeof companySettings>

async function loadLogoData(): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), "public", "everterra-logo.png")
    const buf = await readFile(file)
    return `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

export async function renderInvoicePdf(args: {
  invoice: InvoiceRow
  client: ClientRow | null
  items: ItemRow[]
  company: CompanyRow
}): Promise<Buffer> {
  const { invoice, client, items, company } = args
  const logoData = await loadLogoData()

  return renderToBuffer(
    InvoicePdf({
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: invoice.subtotal,
        taxRate: invoice.taxRate,
        taxAmount: invoice.taxAmount,
        total: invoice.total,
        notes: invoice.notes,
        paymentTerms: invoice.paymentTerms,
        signatoryName: invoice.signatoryName,
        signatoryTitle: invoice.signatoryTitle,
        receivedByName: invoice.receivedByName,
        receivedByCompany: invoice.receivedByCompany,
        items: items.map((it) => ({
          product: it.product,
          origin: it.origin,
          quality: it.quality,
          quantity: it.quantity,
          qty: it.qty,
          unitPrice: it.unitPrice,
          amount: it.amount,
        })),
      },
      client: client
        ? {
            name: client.name,
            contactName: client.contactName,
            email: client.email,
            addressLine1: client.addressLine1,
            addressLine2: client.addressLine2,
            city: client.city,
            state: client.state,
            zip: client.zip,
            country: client.country,
          }
        : null,
      company,
      logoData,
    }),
  )
}
