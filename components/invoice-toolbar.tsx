"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sendInvoice, setInvoiceStatus } from "@/app/actions/invoices"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Loader2, Pencil, Send } from "lucide-react"
import { toast } from "sonner"

const STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]

export function InvoiceToolbar({
  id,
  status,
  invoiceNumber,
}: {
  id: number
  status: string
  invoiceNumber: string
}) {
  const router = useRouter()
  const { t } = useI18n()
  const [current, setCurrent] = useState(status)
  const [statusBusy, setStatusBusy] = useState(false)
  const [sendBusy, setSendBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  async function onStatusChange(next: string) {
    setCurrent(next)
    setStatusBusy(true)
    try {
      await setInvoiceStatus(id, next)
      toast.success(t("invoiceView.statusSet", { status: t(`invoices.status${next}`) }))
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("invoiceView.statusError"))
      setCurrent(status)
    } finally {
      setStatusBusy(false)
    }
  }

  async function onSend() {
    setSendBusy(true)
    try {
      const res = await sendInvoice(id)
      setCurrent("SENT")
      if (res.emailed) {
        toast.success(t("invoiceView.emailed", { to: res.to ?? "" }))
      } else if (!res.configured) {
        toast.success(t("invoiceView.sentNoEmailConfig"))
      } else if (!res.to) {
        toast.success(t("invoiceView.sentNoClientEmail"))
      } else {
        toast.success(t("invoiceView.sent"))
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("invoiceView.sendError"))
    } finally {
      setSendBusy(false)
    }
  }

  async function onDownload() {
    setPdfBusy(true)
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`)
      if (!res.ok) throw new Error(t("invoiceView.pdfFailed"))
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("invoiceView.pdfError"))
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={current} onValueChange={onStatusChange} disabled={statusBusy}>
        <SelectTrigger className="w-36">
          <SelectValue>{(value: string) => t(`invoices.status${value}`)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {t(`invoices.status${s}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => router.push(`/invoices/${id}/edit`)}>
        <Pencil className="size-4" />
        {t("invoiceView.edit")}
      </Button>
      <Button variant="outline" onClick={onDownload} disabled={pdfBusy}>
        {pdfBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        {t("invoiceView.pdf")}
      </Button>
      <Button onClick={onSend} disabled={sendBusy}>
        {sendBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {t("invoiceView.send")}
      </Button>
    </div>
  )
}
