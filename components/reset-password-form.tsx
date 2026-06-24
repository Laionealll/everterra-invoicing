"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p>This reset link is invalid or has expired.</p>
        <Button render={<Link href="/forgot-password" />} nativeButton={false} variant="outline">
          Request a new link
        </Button>
      </div>
    )
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }
    setLoading(true)
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! })
    setLoading(false)
    if (error) {
      toast.error(error.message || "Could not reset password")
      return
    }
    toast.success("Password updated. Please sign in.")
    router.push("/login")
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm">Confirm new password</Label>
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
        Update password
      </Button>
    </form>
  )
}
