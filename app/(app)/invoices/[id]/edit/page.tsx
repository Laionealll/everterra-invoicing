import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getInvoice } from "@/app/actions/invoices"
import { getClientOptions } from "@/app/actions/clients"
import { PageHeader } from "@/components/page-header"
import { InvoiceEditor } from "@/components/invoice-editor"
import { getT } from "@/lib/i18n/server"

function toDateInput(d: Date | string) {
  return new Date(d).toISOString().slice(0, 10)
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const t = await getT()
  const { id } = await params
  const invoiceId = Number(id)
  if (!Number.isFinite(invoiceId)) notFound()

  const [data, clients] = await Promise.all([getInvoice(invoiceId), getClientOptions()])
  if (!data?.invoice) notFound()

  const { invoice, items } = data

  return (
    <>
      <PageHeader
        title={t("editor.editTitle", { number: invoice.invoiceNumber })}
        description={t("editor.editDesc")}
      />
      <div className="p-4 sm:p-8">
        <InvoiceEditor
          clients={clients}
          initial={{
            id: invoice.id,
            clientId: invoice.clientId,
            issueDate: toDateInput(invoice.issueDate),
            dueDate: toDateInput(invoice.dueDate),
            taxRate: String(Number(invoice.taxRate)),
            notes: invoice.notes,
            paymentTerms: invoice.paymentTerms,
            signatoryName: invoice.signatoryName,
            signatoryTitle: invoice.signatoryTitle,
            receivedByName: invoice.receivedByName,
            receivedByCompany: invoice.receivedByCompany,
            items: items.map((it) => ({
              product: it.product,
              origin: it.origin ?? "",
              quality: it.quality ?? "",
              quantity: it.quantity,
              qty: String(Number(it.qty)),
              unitPrice: String(Number(it.unitPrice)),
            })),
          }}
        />
      </div>
    </>
  )
}
