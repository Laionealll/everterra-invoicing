import type React from "react"

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b bg-card px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground text-pretty">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
