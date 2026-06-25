import type React from "react"
import { BrandLogo } from "@/components/brand-logo"
import { LanguageToggle } from "@/components/language-toggle"

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center bg-sidebar p-6">
      <div className="absolute right-4 top-4">
        <LanguageToggle className="text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground" />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="rounded-xl bg-card px-6 py-4 shadow-sm">
            <BrandLogo variant="full" imgClassName="h-12" />
          </div>
          <p className="text-xs uppercase tracking-widest text-sidebar-foreground/70">
            Invoicing Portal
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-balance">{title}</h1>
            {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
          </div>
          {children}
        </div>
        {footer && <div className="mt-4 text-center text-sm text-sidebar-foreground/70">{footer}</div>}
      </div>
    </main>
  )
}
