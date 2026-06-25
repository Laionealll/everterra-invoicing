"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { BrandLogo } from "@/components/brand-logo"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/components/i18n-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  UserCog,
  LogOut,
  ChevronsUpDown,
} from "lucide-react"

type NavUser = { name: string; email: string; role: string }

const baseNav = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/invoices", labelKey: "nav.invoices", icon: FileText },
  { href: "/clients", labelKey: "nav.clients", icon: Users },
]

const adminNav = [
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
  { href: "/admin/users", labelKey: "nav.users", icon: UserCog },
]

export function AppSidebar({ user }: { user: NavUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const isAdmin = user.role === "ADMIN"

  const nav = [...baseNav, ...(isAdmin ? adminNav : [])]

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="flex size-10 items-center justify-center rounded-md bg-card">
          <BrandLogo variant="mark" imgClassName="h-7" />
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-serif text-lg font-semibold tracking-tight text-sidebar-foreground">
            Everterra
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">
            {t("nav.brandSub")}
          </span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 pb-1">
        <LanguageToggle className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground" />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-3 px-2 py-2 text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
            </div>
            <ChevronsUpDown className="size-4 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground capitalize">
                {user.role.toLowerCase()}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="size-4" />
              {t("nav.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
