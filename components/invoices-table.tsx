"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteInvoice } from "@/app/actions/invoices"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuSeparator,
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
import { formatCurrency, formatDate } from "@/lib/format"
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

export type InvoiceRow = {
  id: number
  invoiceNumber: string
  status: string
  issueDate: Date | string
  dueDate: Date | string
  total: string
  clientName: string | null
  clientId: number | null
}

const STATUSES = ["ALL", "DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]

function statusLabel(s: string) {
  return s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()
}

export function InvoicesTable({ invoices }: { invoices: InvoiceRow[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState("ALL")
  const [toDelete, setToDelete] = useState<InvoiceRow | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = status === "ALL" || inv.status === status
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        (inv.clientName ?? "").toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [invoices, query, status])

  async function onConfirmDelete() {
    if (!toDelete) return
    setBusy(true)
    try {
      await deleteInvoice(toDelete.id)
      toast.success(`Deleted ${toDelete.invoiceNumber}`)
      setToDelete(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete invoice")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by number or client..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44">
            <SelectValue>{(value: string) => statusLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {statusLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow key={inv.id} className="group">
                  <TableCell className="font-medium">
                    <Link href={`/invoices/${inv.id}`} className="hover:underline">
                      {inv.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>{inv.clientName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.issueDate)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(inv.total)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="size-8" />}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}`)}>
                          <Eye className="size-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/invoices/${inv.id}/edit`)}>
                          <Pencil className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setToDelete(inv)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete invoice</DialogTitle>
            <DialogDescription>
              {toDelete
                ? `This permanently deletes ${toDelete.invoiceNumber} and its line items.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete} disabled={busy}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
