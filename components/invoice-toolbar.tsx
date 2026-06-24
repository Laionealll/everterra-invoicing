"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { sendInvoice, setInvoiceStatus } from "@/app/actions/invoices"
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
  const [current, setCurrent] = useState(status)
  const [statusBusy, setStatusBusy] = useState(false)
  const [sendBusy, setSendBusy] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  async function onStatusChange(next: string) {
    setCurrent(next)
    setStatusBusy(true)
    try {
      await setInvoiceStatus(id, next)
      toast.success(`Status set to ${next.toLowerCase()}`)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status")
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
        toast.success(`Invoice emailed to ${res.to}`)
      } else if (!res.configured) {
        toast.success("Marked as sent. Email is not configured yet, so no message was sent.")
      } else if (!res.to) {
        toast.success("Marked as sent. Add a client email to send by email.")
      } else {
        toast.success("Marked as sent.")
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send invoice")
    } finally {
      setSendBusy(false)
    }
  }

  async function onDownload() {
    setPdfBusy(true)
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`)
      if (!res.ok) throw new Error("Failed to generate PDF")
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
      toast.error(err instanceof Error ? err.message : "Could not download PDF")
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={current} onValueChange={onStatusChange} disabled={statusBusy}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" onClick={() => router.push(`/invoices/${id}/edit`)}>
        <Pencil className="size-4" />
        Edit
      </Button>
      <Button variant="outline" onClick={onDownload} disabled={pdfBusy}>
        {pdfBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        PDF
      </Button>
      <Button onClick={onSend} disabled={sendBusy}>
        {sendBusy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send
      </Button>
    </div>
  )
}
