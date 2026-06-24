import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getInvoice } from "@/app/actions/invoices"
import { getSettings } from "@/app/actions/settings"
import { PageHeader } from "@/components/page-header"
import { InvoiceDocument } from "@/components/invoice-document"
import { InvoiceToolbar } from "@/components/invoice-toolbar"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function InvoiceViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const { id } = await params
  const invoiceId = Number(id)
  if (!Number.isFinite(invoiceId)) notFound()

  const [data, company] = await Promise.all([getInvoice(invoiceId), getSettings()])
  if (!data?.invoice) notFound()

  const { invoice, client, items } = data

  return (
    <>
      <PageHeader title={invoice.invoiceNumber} description={client?.name ?? "Unknown client"}>
        <InvoiceToolbar
          id={invoice.id}
          status={invoice.status}
          invoiceNumber={invoice.invoiceNumber}
        />
      </PageHeader>

      <div className="space-y-4 p-4 sm:p-8">
        <div className="flex items-center justify-between">
          <Button render={<Link href="/invoices" />} nativeButton={false} variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Back to invoices
          </Button>
          <StatusBadge status={invoice.status} />
        </div>

        <div className="overflow-hidden rounded-xl border border-border shadow-sm">
          <InvoiceDocument
            invoice={{
              invoiceNumber: invoice.invoiceNumber,
              status: invoice.status,
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
              items: items.map((it) => ({
                product: it.product,
                origin: it.origin,
                quality: it.quality,
                quantity: it.quantity,
                qty: it.qty,
                unitPrice: it.unitPrice,
                amount: it.amount,
              })),
            }}
            client={client}
            company={company}
          />
        </div>
      </div>
    </>
  )
}
