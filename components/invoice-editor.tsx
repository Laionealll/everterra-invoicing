"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createInvoice, updateInvoice, type InvoiceInput } from "@/app/actions/invoices"
import { computeTotals } from "@/lib/calc"
import { formatCurrency } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

type ClientOption = { id: number; name: string }

type EditorItem = {
  product: string
  origin: string
  quality: string
  quantity: string
  qty: string
  unitPrice: string
}

export type InvoiceEditorData = {
  id?: number
  clientId: number | null
  issueDate: string
  dueDate: string
  taxRate: string
  notes: string
  paymentTerms: string
  signatoryName: string
  signatoryTitle: string
  items: EditorItem[]
}

function emptyItem(): EditorItem {
  return { product: "", origin: "", quality: "", quantity: "", qty: "", unitPrice: "" }
}

export function InvoiceEditor({
  clients,
  initial,
}: {
  clients: ClientOption[]
  initial: InvoiceEditorData
}) {
  const router = useRouter()
  const [clientId, setClientId] = useState<string>(
    initial.clientId ? String(initial.clientId) : "",
  )
  const [issueDate, setIssueDate] = useState(initial.issueDate)
  const [dueDate, setDueDate] = useState(initial.dueDate)
  const [taxRate, setTaxRate] = useState(initial.taxRate)
  const [notes, setNotes] = useState(initial.notes)
  const [paymentTerms, setPaymentTerms] = useState(initial.paymentTerms)
  const [signatoryName, setSignatoryName] = useState(initial.signatoryName)
  const [signatoryTitle, setSignatoryTitle] = useState(initial.signatoryTitle)
  const [items, setItems] = useState<EditorItem[]>(
    initial.items.length ? initial.items : [emptyItem()],
  )
  const [busy, setBusy] = useState<"draft" | "send" | null>(null)

  const totals = useMemo(() => {
    return computeTotals(
      items.map((it) => ({
        qty: Number(it.qty) || 0,
        unitPrice: Number(it.unitPrice) || 0,
      })),
      Number(taxRate) || 0,
    )
  }, [items, taxRate])

  function updateItem(index: number, patch: Partial<EditorItem>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()])
  }

  function removeItem(index: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))
  }

  function buildInput(status: "DRAFT" | "SENT"): InvoiceInput {
    return {
      clientId: Number(clientId),
      issueDate,
      dueDate,
      status,
      taxRate: Number(taxRate) || 0,
      notes,
      paymentTerms,
      signatoryName,
      signatoryTitle,
      items: items
        .filter((it) => it.product.trim() || Number(it.qty) || Number(it.unitPrice))
        .map((it) => ({
          product: it.product,
          origin: it.origin,
          quality: it.quality,
          quantity: it.quantity,
          qty: Number(it.qty) || 0,
          unitPrice: Number(it.unitPrice) || 0,
        })),
    }
  }

  async function save(status: "DRAFT" | "SENT") {
    if (!clientId) {
      toast.error("Please select a client")
      return
    }
    const input = buildInput(status)
    if (!input.items.length) {
      toast.error("Add at least one line item")
      return
    }
    setBusy(status === "SENT" ? "send" : "draft")
    try {
      if (initial.id) {
        await updateInvoice(initial.id, input)
        toast.success("Invoice updated")
        router.push(`/invoices/${initial.id}`)
      } else {
        const created = await createInvoice(input)
        toast.success(status === "SENT" ? "Invoice created and marked sent" : "Draft saved")
        router.push(`/invoices/${created.id}`)
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save invoice")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client">
                    {(value: string) =>
                      clients.find((c) => String(c.id) === value)?.name ?? "Select a client"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="issueDate">Issue date</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Line items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="size-4" />
              Add item
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-12"
              >
                <div className="flex flex-col gap-1.5 sm:col-span-12">
                  <Label className="text-xs text-muted-foreground">Product</Label>
                  <Input
                    value={it.product}
                    placeholder="e.g. Fresh Hass Avocados"
                    onChange={(e) => updateItem(i, { product: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">Origin</Label>
                  <Input
                    value={it.origin}
                    placeholder="Mexico"
                    onChange={(e) => updateItem(i, { origin: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">Quality</Label>
                  <Input
                    value={it.quality}
                    placeholder="Grade A"
                    onChange={(e) => updateItem(i, { quality: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Packaging</Label>
                  <Input
                    value={it.quantity}
                    placeholder="48 ct box"
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Qty</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={it.qty}
                    onChange={(e) => updateItem(i, { qty: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">Unit price</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={it.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                  />
                </div>
                <div className="flex items-end justify-between gap-2 sm:col-span-12">
                  <span className="text-sm text-muted-foreground">
                    Amount:{" "}
                    <span className="font-medium text-foreground tabular-nums">
                      {formatCurrency((Number(it.qty) || 0) * (Number(it.unitPrice) || 0))}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeItem(i)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes & terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="paymentTerms">Payment terms</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signatoryName">Signatory name</Label>
              <Input
                id="signatoryName"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signatoryTitle">Signatory title</Label>
              <Input
                id="signatoryTitle"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="taxRate" className="text-sm text-muted-foreground">
                Tax rate %
              </Label>
              <Input
                id="taxRate"
                type="number"
                inputMode="decimal"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="h-8 w-24"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="font-medium tabular-nums">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold tabular-nums">{formatCurrency(totals.total)}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => save("DRAFT")} variant="outline" disabled={busy !== null}>
                {busy === "draft" && <Loader2 className="size-4 animate-spin" />}
                {initial.id ? "Save changes" : "Save draft"}
              </Button>
              <Button onClick={() => save("SENT")} disabled={busy !== null}>
                {busy === "send" && <Loader2 className="size-4 animate-spin" />}
                {initial.id ? "Save & mark sent" : "Create & mark sent"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
