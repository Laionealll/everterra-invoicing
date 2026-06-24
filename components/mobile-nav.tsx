"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
} from "lucide-react"

type NavUser = { name: string; email: string; role: string }

const baseNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
]
const adminNav = [
  { href: "/settings", label: "Company Settings", icon: Settings },
  { href: "/admin/users", label: "Users", icon: UserCog },
]

export function MobileNav({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const nav = [...baseNav, ...(user.role === "ADMIN" ? adminNav : [])]

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="md:hidden">
      <header className="flex h-14 items-center justify-between border-b bg-sidebar px-4 text-sidebar-foreground">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-card">
            <BrandLogo variant="mark" imgClassName="h-5" />
          </div>
          <span className="font-serif text-base font-semibold tracking-tight text-sidebar-foreground">
            Everterra
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((o) => !o)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/60"
          aria-label="Toggle navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>
      {open && (
        <nav className="border-b bg-sidebar p-3 text-sidebar-foreground">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/")
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </nav>
      )}
    </div>
  )
}
