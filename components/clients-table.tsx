"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteClient } from "@/app/actions/clients"
import { ClientFormDialog } from "@/components/client-form-dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

export type ClientRow = {
  id: number
  name: string
  contactName: string | null
  email: string | null
  phone: string | null
  addressLine1: string | null
  addressLine2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  notes: string | null
  invoiceCount: number
}

export function ClientsTable({ clients }: { clients: ClientRow[] }) {
  const router = useRouter()
  const { t } = useI18n()
  const [editing, setEditing] = useState<ClientRow | null>(null)
  const [deleting, setDeleting] = useState<ClientRow | null>(null)
  const [busy, setBusy] = useState(false)

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    try {
      await deleteClient(deleting.id)
      toast.success(t("clients.deleted"))
      setDeleting(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("clients.deleteError"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("clients.colClient")}</TableHead>
              <TableHead className="hidden sm:table-cell">{t("clients.colContact")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("clients.colLocation")}</TableHead>
              <TableHead className="text-right">{t("clients.colInvoices")}</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{c.name}</span>
                    {c.email && (
                      <span className="text-sm text-muted-foreground">{c.email}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {c.contactName || "—"}
                  {c.phone ? <div className="text-xs">{c.phone}</div> : null}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">{c.invoiceCount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon" className="size-8" />}
                    >
                      <MoreHorizontal className="size-4" />
                      <span className="sr-only">{t("common.actions")}</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditing(c)}>
                        <Pencil className="size-4" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleting(c)}
                      >
                        <Trash2 className="size-4" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <ClientFormDialog
          client={{
            id: editing.id,
            name: editing.name,
            contactName: editing.contactName ?? "",
            email: editing.email ?? "",
            phone: editing.phone ?? "",
            addressLine1: editing.addressLine1 ?? "",
            addressLine2: editing.addressLine2 ?? "",
            city: editing.city ?? "",
            state: editing.state ?? "",
            zip: editing.zip ?? "",
            country: editing.country ?? "USA",
            notes: editing.notes ?? "",
          }}
          open={Boolean(editing)}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      )}

      <Dialog open={Boolean(deleting)} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clients.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("clients.deleteDesc", { name: deleting?.name ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" disabled={busy} onClick={confirmDelete}>
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
