"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ForgotPasswordForm() {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    })
    setLoading(false)
    if (error) {
      toast.error(error.message || t("auth.resetStartError"))
      return
    }
    setSent(true)
    toast.success(t("auth.resetSent"))
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p className="text-pretty">{t("auth.resetSentLong", { email })}</p>
        <Button render={<Link href="/login" />} nativeButton={false} variant="outline">
          {t("auth.backToSignIn")}
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.emailPlaceholder")}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        {t("auth.sendResetLink")}
      </Button>
      <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
        {t("auth.backToSignIn")}
      </Button>
    </form>
  )
}
