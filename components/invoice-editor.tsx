"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createInvoice, updateInvoice, type InvoiceInput } from "@/app/actions/invoices"
import { computeTotals } from "@/lib/calc"
import { formatCurrency } from "@/lib/format"
import { useI18n } from "@/components/i18n-provider"
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
  receivedByName: string
  receivedByCompany: string
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
  const { t } = useI18n()
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
  const [receivedByName, setReceivedByName] = useState(initial.receivedByName)
  const [receivedByCompany, setReceivedByCompany] = useState(initial.receivedByCompany)
  // Una vez el usuario edita la compañía manualmente, dejamos de autocompletarla.
  const [companyTouched, setCompanyTouched] = useState(Boolean(initial.receivedByCompany))
  const [items, setItems] = useState<EditorItem[]>(
    initial.items.length ? initial.items : [emptyItem()],
  )
  const [busy, setBusy] = useState<"draft" | "send" | null>(null)

  // Al elegir un cliente, autocompleta la compañía de "Recibido por" con su
  // nombre, salvo que el usuario ya la haya escrito a mano.
  function onClientChange(next: string) {
    setClientId(next)
    if (!companyTouched) {
      const client = clients.find((c) => String(c.id) === next)
      setReceivedByCompany(client?.name ?? "")
    }
  }

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
      receivedByName,
      receivedByCompany,
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
      toast.error(t("editor.selectClientError"))
      return
    }
    const input = buildInput(status)
    if (!input.items.length) {
      toast.error(t("editor.addItemError"))
      return
    }
    setBusy(status === "SENT" ? "send" : "draft")
    try {
      if (initial.id) {
        await updateInvoice(initial.id, input)
        toast.success(t("editor.updated"))
        router.push(`/invoices/${initial.id}`)
      } else {
        const created = await createInvoice(input)
        toast.success(status === "SENT" ? t("editor.createdSent") : t("editor.draftSaved"))
        router.push(`/invoices/${created.id}`)
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("editor.saveError"))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("editor.details")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label>{t("editor.client")}</Label>
              <Select value={clientId} onValueChange={onClientChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("editor.selectClient")}>
                    {(value: string) =>
                      clients.find((c) => String(c.id) === value)?.name ?? t("editor.selectClient")
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
              <Label htmlFor="issueDate">{t("editor.issueDate")}</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dueDate">{t("editor.dueDate")}</Label>
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
            <CardTitle className="text-base">{t("editor.lineItems")}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="size-4" />
              {t("editor.addItem")}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {items.map((it, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-12"
              >
                <div className="flex flex-col gap-1.5 sm:col-span-12">
                  <Label className="text-xs text-muted-foreground">{t("editor.product")}</Label>
                  <Input
                    value={it.product}
                    placeholder={t("editor.productPlaceholder")}
                    onChange={(e) => updateItem(i, { product: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">{t("editor.origin")}</Label>
                  <Input
                    value={it.origin}
                    placeholder={t("editor.originPlaceholder")}
                    onChange={(e) => updateItem(i, { origin: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-3">
                  <Label className="text-xs text-muted-foreground">{t("editor.quality")}</Label>
                  <Input
                    value={it.quality}
                    placeholder={t("editor.qualityPlaceholder")}
                    onChange={(e) => updateItem(i, { quality: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">{t("editor.packaging")}</Label>
                  <Input
                    value={it.quantity}
                    placeholder={t("editor.packagingPlaceholder")}
                    onChange={(e) => updateItem(i, { quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">{t("editor.qty")}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={it.qty}
                    onChange={(e) => updateItem(i, { qty: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="text-xs text-muted-foreground">{t("editor.unitPrice")}</Label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={it.unitPrice}
                    onChange={(e) => updateItem(i, { unitPrice: e.target.value })}
                  />
                </div>
                <div className="flex items-end justify-between gap-2 sm:col-span-12">
                  <span className="text-sm text-muted-foreground">
                    {t("editor.amount")}:{" "}
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
                    {t("editor.remove")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("editor.notesTerms")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="paymentTerms">{t("editor.paymentTerms")}</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="notes">{t("editor.notes")}</Label>
              <Textarea
                id="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signatoryName">{t("editor.signatoryName")}</Label>
              <Input
                id="signatoryName"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="signatoryTitle">{t("editor.signatoryTitle")}</Label>
              <Input
                id="signatoryTitle"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label className="text-sm font-medium">{t("editor.receivedBy")}</Label>
              <p className="-mt-1 text-xs text-muted-foreground">{t("editor.receivedByHint")}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="receivedByName">{t("editor.receivedByName")}</Label>
              <Input
                id="receivedByName"
                value={receivedByName}
                onChange={(e) => setReceivedByName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="receivedByCompany">{t("editor.receivedByCompany")}</Label>
              <Input
                id="receivedByCompany"
                value={receivedByCompany}
                onChange={(e) => {
                  setCompanyTouched(true)
                  setReceivedByCompany(e.target.value)
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="text-base">{t("editor.summary")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("editor.subtotal")}</span>
              <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="taxRate" className="text-sm text-muted-foreground">
                {t("editor.taxRate")}
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
              <span className="text-muted-foreground">{t("editor.tax")}</span>
              <span className="font-medium tabular-nums">{formatCurrency(totals.taxAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4 text-base">
              <span className="font-semibold">{t("editor.total")}</span>
              <span className="font-semibold tabular-nums">{formatCurrency(totals.total)}</span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={() => save("DRAFT")} variant="outline" disabled={busy !== null}>
                {busy === "draft" && <Loader2 className="size-4 animate-spin" />}
                {initial.id ? t("editor.saveChanges") : t("editor.saveDraft")}
              </Button>
              <Button onClick={() => save("SENT")} disabled={busy !== null}>
                {busy === "send" && <Loader2 className="size-4 animate-spin" />}
                {initial.id ? t("editor.saveMarkSent") : t("editor.createMarkSent")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
