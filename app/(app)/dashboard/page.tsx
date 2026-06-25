import Link from "next/link"
import { requireUser } from "@/lib/session"
import { getInvoices, getInvoiceStats } from "@/app/actions/invoices"
import { getClientsWithCounts } from "@/app/actions/clients"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/format"
import { getT } from "@/lib/i18n/server"
import { CircleDollarSign, FileText, Users, Wallet, Plus, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const user = await requireUser()
  const t = await getT()
  const [stats, invoices, clients] = await Promise.all([
    getInvoiceStats(),
    getInvoices(),
    getClientsWithCounts(),
  ])
  const recent = invoices.slice(0, 6)
  const firstName = user.name.split(" ")[0]

  return (
    <>
      <PageHeader
        title={t("dashboard.welcome", { name: firstName })}
        description={t("dashboard.overview")}
      >
        <Button render={<Link href="/invoices/new" />} nativeButton={false}>
          <Plus className="size-4" />
          {t("dashboard.newInvoice")}
        </Button>
      </PageHeader>

      <div className="space-y-6 p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("dashboard.outstanding")}
            value={formatCurrency(stats.outstanding)}
            hint={t("dashboard.outstandingHint")}
            icon={CircleDollarSign}
          />
          <StatCard
            label={t("dashboard.paid")}
            value={formatCurrency(stats.paid)}
            hint={t("dashboard.paidHint")}
            icon={Wallet}
          />
          <StatCard
            label={t("dashboard.invoicesCount")}
            value={String(stats.count)}
            hint={t("dashboard.invoicesHint")}
            icon={FileText}
          />
          <StatCard
            label={t("dashboard.clientsCount")}
            value={String(clients.length)}
            hint={t("dashboard.clientsHint")}
            icon={Users}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t("dashboard.recentInvoices")}</CardTitle>
            <Button render={<Link href="/invoices" />} nativeButton={false} variant="ghost" size="sm">
              {t("dashboard.viewAll")}
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">{t("dashboard.noInvoices")}</p>
                <Button render={<Link href="/invoices/new" />} nativeButton={false} size="sm">
                  {t("dashboard.createFirst")}
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {recent.map((inv) => (
                  <Link
                    key={inv.id}
                    href={`/invoices/${inv.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-muted/50 -mx-2 px-2 rounded-md"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{inv.invoiceNumber}</span>
                      <span className="text-sm text-muted-foreground">
                        {inv.clientName ?? t("dashboard.unknownClient")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="hidden text-sm text-muted-foreground sm:inline">
                        {formatDate(inv.issueDate)}
                      </span>
                      <StatusBadge status={inv.status} />
                      <span className="w-24 text-right font-medium tabular-nums">
                        {formatCurrency(inv.total)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
