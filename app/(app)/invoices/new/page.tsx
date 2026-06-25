import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getClientOptions } from "@/app/actions/clients"
import { getSettings } from "@/app/actions/settings"
import { PageHeader } from "@/components/page-header"
import { InvoiceEditor } from "@/components/invoice-editor"
import { getT } from "@/lib/i18n/server"

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function NewInvoicePage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const t = await getT()
  const [clients, settings] = await Promise.all([getClientOptions(), getSettings()])

  const today = new Date()
  const due = new Date()
  due.setDate(due.getDate() + 7)

  return (
    <div>
      <PageHeader title={t("editor.newTitle")} description={t("editor.newDesc")} />
      <div className="p-4 sm:p-8">
        <InvoiceEditor
          clients={clients}
          initial={{
            clientId: null,
            issueDate: toDateInput(today),
            dueDate: toDateInput(due),
            taxRate: "0",
            notes: settings.defaultNotes,
            paymentTerms: settings.defaultPaymentTerms,
            signatoryName: settings.defaultSignatoryName,
            signatoryTitle: settings.defaultSignatoryTitle,
            receivedByName: "",
            receivedByCompany: "",
            items: [],
          }}
        />
      </div>
    </div>
  )
}
