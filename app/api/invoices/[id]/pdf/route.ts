import { getInvoice } from "@/app/actions/invoices"
import { getSettings } from "@/app/actions/settings"
import { renderInvoicePdf } from "@/lib/pdf/render-invoice"
import { getCurrentUser } from "@/lib/session"

export const runtime = "nodejs"

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

  const [data, company] = await Promise.all([getInvoice(invoiceId), getSettings()])
  if (!data?.invoice) {
    return new Response("Invoice not found", { status: 404 })
  }

  const { invoice, client, items } = data

  const buffer = await renderInvoicePdf({ invoice, client, items, company })

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  })
}
