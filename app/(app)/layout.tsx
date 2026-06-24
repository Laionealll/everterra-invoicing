import type React from "react"
import { requireUser } from "@/lib/session"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser()
  const navUser = { name: user.name, email: user.email, role: user.role }

  return (
    <div className="flex min-h-svh bg-background">
      <AppSidebar user={navUser} />
      <div className="flex flex-1 flex-col">
        <MobileNav user={navUser} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
