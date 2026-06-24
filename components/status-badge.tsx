import { cn } from "@/lib/utils"
import { STATUS_LABELS, statusBadgeClasses, type InvoiceStatus } from "@/lib/format"

export function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status as InvoiceStatus] ?? status
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        statusBadgeClasses(status),
      )}
    >
      {label}
    </span>
  )
}
