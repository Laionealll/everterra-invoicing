"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ResetPasswordForm() {
  const router = useRouter()
  const { t } = useI18n()
  const params = useSearchParams()
  const token = params.get("token")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p>{t("auth.linkInvalid")}</p>
        <Button render={<Link href="/forgot-password" />} nativeButton={false} variant="outline">
          {t("auth.requestNewLink")}
        </Button>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error(t("auth.passwordTooShort"))
      return
    }
    if (password !== confirm) {
      toast.error(t("auth.passwordsNoMatch"))
      return
    }
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! })
    setLoading(false)
    if (error) {
      toast.error(error.message || t("auth.resetError"))
      return
    }
    toast.success(t("auth.passwordUpdated"))
    router.push("/login")
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("auth.newPassword")}</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("auth.passwordMin")}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
        <Input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        {t("auth.updatePassword")}
      </Button>
    </form>
  )
}
