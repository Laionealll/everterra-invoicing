export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? Number.parseFloat(value || "0") : value
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(num) ? num : 0)
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—"
  const date = typeof value === "string" ? new Date(value + "T00:00:00") : value
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return ""
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"

export const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
}

export function statusBadgeClasses(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-primary/15 text-primary border-primary/30"
    case "SENT":
      return "bg-chart-3/15 text-chart-3 border-chart-3/30"
    case "OVERDUE":
      return "bg-destructive/15 text-destructive border-destructive/30"
    case "CANCELLED":
      return "bg-muted text-muted-foreground border-border"
    default:
      return "bg-accent text-accent-foreground border-border"
  }
}
