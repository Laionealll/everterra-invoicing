"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function ForgotPasswordForm() {
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
      toast.error(error.message || "Could not start password reset")
      return
    }
    setSent(true)
    toast.success("If that email exists, a reset link has been sent")
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-sm text-muted-foreground">
        <p className="text-pretty">
          If an account exists for <span className="font-medium text-foreground">{email}</span>, a
          password reset link has been sent. Check your inbox and spam folder.
        </p>
        <Button render={<Link href="/login" />} nativeButton={false} variant="outline">
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@everterra.com"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
      <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
        Back to sign in
      </Button>
    </form>
  )
}
