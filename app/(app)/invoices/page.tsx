import Link from "next/link"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getInvoices } from "@/app/actions/invoices"
import { PageHeader } from "@/components/page-header"
import { InvoicesTable, type InvoiceRow } from "@/components/invoices-table"
import { Button } from "@/components/ui/button"
import { getT } from "@/lib/i18n/server"
import { Plus } from "lucide-react"

export default async function InvoicesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const t = await getT()
  const invoices = (await getInvoices()) as InvoiceRow[]

  return (
    <div>
      <PageHeader title={t("invoices.title")} description={t("invoices.desc")}>
        <Button render={<Link href="/invoices/new" />} nativeButton={false}>
          <Plus className="size-4" />
          {t("invoices.newInvoice")}
        </Button>
      </PageHeader>
      <div className="p-4 sm:p-8">
        <InvoicesTable invoices={invoices} />
      </div>
    </div>
  )
}
