"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateSettings, type SettingsInput } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

type Settings = SettingsInput

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const input = Object.fromEntries(fd.entries()) as unknown as SettingsInput
    setLoading(true)
    try {
      await updateSettings(input)
      toast.success("Settings saved")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save settings")
    } finally {
      setLoading(false)
    }
  }

  function field(name: keyof Settings) {
    return settings[name] ?? ""
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company identity</CardTitle>
          <CardDescription>Shown on the invoice header and footer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="legalName">Legal name</Label>
            <Input id="legalName" name="legalName" defaultValue={field("legalName")} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={field("tagline")} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="registeredAddress">Registered address</Label>
            <Input
              id="registeredAddress"
              name="registeredAddress"
              defaultValue={field("registeredAddress")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="operations">Operations / market</Label>
            <Input id="operations" name="operations" defaultValue={field("operations")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" defaultValue={field("phone")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={field("email")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment details</CardTitle>
          <CardDescription>Appears in the payment instructions block.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="zelleEmail">Zelle email</Label>
            <Input id="zelleEmail" name="zelleEmail" defaultValue={field("zelleEmail")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="acceptedMethods">Accepted methods</Label>
            <Input
              id="acceptedMethods"
              name="acceptedMethods"
              defaultValue={field("acceptedMethods")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bankName">Bank name</Label>
            <Input id="bankName" name="bankName" defaultValue={field("bankName")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="accountNumber">Account number</Label>
            <Input id="accountNumber" name="accountNumber" defaultValue={field("accountNumber")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="routingNumber">Routing number</Label>
            <Input id="routingNumber" name="routingNumber" defaultValue={field("routingNumber")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice defaults</CardTitle>
          <CardDescription>Pre-filled when creating a new invoice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultSignatoryName">Signatory name</Label>
            <Input
              id="defaultSignatoryName"
              name="defaultSignatoryName"
              defaultValue={field("defaultSignatoryName")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultSignatoryTitle">Signatory title</Label>
            <Input
              id="defaultSignatoryTitle"
              name="defaultSignatoryTitle"
              defaultValue={field("defaultSignatoryTitle")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="defaultPaymentTerms">Payment terms</Label>
            <Input
              id="defaultPaymentTerms"
              name="defaultPaymentTerms"
              defaultValue={field("defaultPaymentTerms")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="defaultNotes">Default notes / terms</Label>
            <Textarea
              id="defaultNotes"
              name="defaultNotes"
              rows={4}
              defaultValue={field("defaultNotes")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Save settings
        </Button>
      </div>
    </form>
  )
}
