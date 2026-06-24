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
import { CircleDollarSign, FileText, Users, Wallet, Plus, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const user = await requireUser()
  const [stats, invoices, clients] = await Promise.all([
    getInvoiceStats(),
    getInvoices(),
    getClientsWithCounts(),
  ])
  const recent = invoices.slice(0, 6)
  const firstName = user.name.split(" ")[0]

  return (
    <>
      <PageHeader title={`Welcome back, ${firstName}`} description="Here is your invoicing overview.">
        <Button render={<Link href="/invoices/new" />} nativeButton={false}>
          <Plus className="size-4" />
          New Invoice
        </Button>
      </PageHeader>

      <div className="space-y-6 p-4 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Outstanding"
            value={formatCurrency(stats.outstanding)}
            hint="Sent & overdue"
            icon={CircleDollarSign}
          />
          <StatCard
            label="Paid"
            value={formatCurrency(stats.paid)}
            hint="All time"
            icon={Wallet}
          />
          <StatCard
            label="Invoices"
            value={String(stats.count)}
            hint="Total created"
            icon={FileText}
          />
          <StatCard label="Clients" value={String(clients.length)} hint="Active" icon={Users} />
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent invoices</CardTitle>
            <Button render={<Link href="/invoices" />} nativeButton={false} variant="ghost" size="sm">
              View all
              <ArrowRight className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
                <Button render={<Link href="/invoices/new" />} nativeButton={false} size="sm">
                  Create your first invoice
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
                        {inv.clientName ?? "Unknown client"}
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
