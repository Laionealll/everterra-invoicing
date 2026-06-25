import { readFile } from "node:fs/promises"
import path from "node:path"
import { renderToBuffer } from "@react-pdf/renderer"
import { getInvoice } from "@/app/actions/invoices"
import { getSettings } from "@/app/actions/settings"
import { InvoicePdf } from "@/lib/pdf/invoice-pdf"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

async function loadLogoData(): Promise<string | null> {
  try {
    const file = path.join(process.cwd(), "public", "everterra-logo.png")
    const buf = await readFile(file)
    return `data:image/png;base64,${buf.toString("base64")}`
  } catch {
    return null
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser()
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { id } = await params
  const invoiceId = Number(id)
  if (!Number.isFinite(invoiceId)) {
    return new Response("Invalid invoice id", { status: 400 })
  }

  const [data, company, logoData] = await Promise.all([
    getInvoice(invoiceId),
    getSettings(),
    loadLogoData(),
  ])
  if (!data?.invoice) {
    return new Response("Invoice not found", { status: 404 })
  }

  const { invoice, client, items } = data

  const buffer = await renderToBuffer(
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

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  })
}
