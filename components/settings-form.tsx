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
import { useI18n } from "@/components/i18n-provider"
import { Loader2 } from "lucide-react"

type Settings = SettingsInput

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const input = Object.fromEntries(fd.entries()) as unknown as SettingsInput
    setLoading(true)
    try {
      await updateSettings(input)
      toast.success(t("settings.saved"))
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("settings.saveError"))
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
          <CardTitle className="text-base">{t("settings.identity")}</CardTitle>
          <CardDescription>{t("settings.identityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="legalName">{t("settings.legalName")}</Label>
            <Input id="legalName" name="legalName" defaultValue={field("legalName")} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tagline">{t("settings.tagline")}</Label>
            <Input id="tagline" name="tagline" defaultValue={field("tagline")} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="registeredAddress">{t("settings.registeredAddress")}</Label>
            <Input
              id="registeredAddress"
              name="registeredAddress"
              defaultValue={field("registeredAddress")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="operations">{t("settings.operations")}</Label>
            <Input id="operations" name="operations" defaultValue={field("operations")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">{t("settings.phone")}</Label>
            <Input id="phone" name="phone" defaultValue={field("phone")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("settings.email")}</Label>
            <Input id="email" name="email" type="email" defaultValue={field("email")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.payment")}</CardTitle>
          <CardDescription>{t("settings.paymentDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="zelleEmail">{t("settings.zelleEmail")}</Label>
            <Input id="zelleEmail" name="zelleEmail" defaultValue={field("zelleEmail")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="acceptedMethods">{t("settings.acceptedMethods")}</Label>
            <Input
              id="acceptedMethods"
              name="acceptedMethods"
              defaultValue={field("acceptedMethods")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bankName">{t("settings.bankName")}</Label>
            <Input id="bankName" name="bankName" defaultValue={field("bankName")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="accountNumber">{t("settings.accountNumber")}</Label>
            <Input id="accountNumber" name="accountNumber" defaultValue={field("accountNumber")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="routingNumber">{t("settings.routingNumber")}</Label>
            <Input id="routingNumber" name="routingNumber" defaultValue={field("routingNumber")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("settings.defaults")}</CardTitle>
          <CardDescription>{t("settings.defaultsDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultSignatoryName">{t("settings.defSignatoryName")}</Label>
            <Input
              id="defaultSignatoryName"
              name="defaultSignatoryName"
              defaultValue={field("defaultSignatoryName")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="defaultSignatoryTitle">{t("settings.defSignatoryTitle")}</Label>
            <Input
              id="defaultSignatoryTitle"
              name="defaultSignatoryTitle"
              defaultValue={field("defaultSignatoryTitle")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="defaultPaymentTerms">{t("settings.defPaymentTerms")}</Label>
            <Input
              id="defaultPaymentTerms"
              name="defaultPaymentTerms"
              defaultValue={field("defaultPaymentTerms")}
            />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="defaultNotes">{t("settings.defNotes")}</Label>
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
          {t("settings.saveSettings")}
        </Button>
      </div>
    </form>
  )
}
