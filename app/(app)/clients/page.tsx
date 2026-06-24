import { getClientsWithCounts } from "@/app/actions/clients"
import { PageHeader } from "@/components/page-header"
import { ClientsTable } from "@/components/clients-table"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { Button } from "@/components/ui/button"
import { DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users } from "lucide-react"

export default async function ClientsPage() {
  const clients = await getClientsWithCounts()

  return (
    <>
      <PageHeader title="Clients" description="Manage the businesses you invoice.">
        <ClientFormDialog
          trigger={
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              New Client
            </DialogTrigger>
          }
        />
      </PageHeader>

      <div className="p-4 sm:p-8">
        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Users className="size-6" />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-medium">No clients yet</p>
                <p className="text-sm text-muted-foreground">
                  Add your first client to start invoicing.
                </p>
              </div>
              <ClientFormDialog
                trigger={
                  <DialogTrigger render={<Button />}>
                    <Plus className="size-4" />
                    New Client
                  </DialogTrigger>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <ClientsTable clients={clients} />
        )}
      </div>
    </>
  )
}
