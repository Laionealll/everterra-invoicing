"use client"

import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { statusBadgeClasses } from "@/lib/format"

export function StatusBadge({ status }: { status: string }) {
  const { t } = useI18n()
  // Las claves siguen el patrón invoices.statusDRAFT, invoices.statusSENT, etc.
  const label = t(`invoices.status${status}`)
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
