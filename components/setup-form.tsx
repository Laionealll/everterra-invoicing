"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFirstAdmin } from "@/app/actions/users"
import { authClient } from "@/lib/auth-client"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function SetupForm() {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get("name") || "")
    const email = String(fd.get("email") || "")
    const password = String(fd.get("password") || "")
    setLoading(true)
    try {
      await createFirstAdmin({ name, email, password })
      // Sign the new admin in immediately.
      await authClient.signIn.email({ email, password })
      toast.success(t("auth.adminCreated"))
      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("auth.setupError"))
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("auth.yourName")}</Label>
        <Input id="name" name="name" required placeholder={t("auth.namePlaceholder")} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input id="email" name="email" type="email" required placeholder={t("auth.emailPlaceholder")} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          placeholder={t("auth.passwordMin")}
        />
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {t("auth.createAdmin")}
      </Button>
    </form>
  )
}
