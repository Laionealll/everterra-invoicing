"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient, updateClient, type ClientInput } from "@/app/actions/clients"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useI18n } from "@/components/i18n-provider"
import { Loader2 } from "lucide-react"

type ClientRecord = ClientInput & { id?: number }

export function ClientFormDialog({
  trigger,
  client,
  open: controlledOpen,
  onOpenChange,
}: {
  trigger?: React.ReactNode
  client?: ClientRecord
  open?: boolean
  onOpenChange?: (o: boolean) => void
}) {
  const router = useRouter()
  const { t } = useI18n()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(client?.id)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const input: ClientInput = {
      name: String(fd.get("name") || ""),
      contactName: String(fd.get("contactName") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      addressLine1: String(fd.get("addressLine1") || ""),
      addressLine2: String(fd.get("addressLine2") || ""),
      city: String(fd.get("city") || ""),
      state: String(fd.get("state") || ""),
      zip: String(fd.get("zip") || ""),
      country: String(fd.get("country") || "USA"),
      notes: String(fd.get("notes") || ""),
    }
    if (!input.name.trim()) {
      toast.error(t("clients.nameRequired"))
      return
    }
    setLoading(true)
    try {
      if (isEdit && client?.id) {
        await updateClient(client.id, input)
        toast.success(t("clients.updated"))
      } else {
        await createClient(input)
        toast.success(t("clients.created"))
      }
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("clients.genericError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("clients.editTitle") : t("clients.formTitle")}</DialogTitle>
          <DialogDescription>
            {isEdit ? t("clients.editDesc") : t("clients.formDesc")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">{t("clients.name")}</Label>
            <Input id="name" name="name" required defaultValue={client?.name} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactName">{t("clients.contactName")}</Label>
              <Input id="contactName" name="contactName" defaultValue={client?.contactName} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">{t("clients.phone")}</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t("clients.email")}</Label>
            <Input id="email" name="email" type="email" defaultValue={client?.email} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addressLine1">{t("clients.address")}</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder={t("clients.street")}
              defaultValue={client?.addressLine1}
            />
            <Input
              name="addressLine2"
              placeholder={t("clients.suite")}
              defaultValue={client?.addressLine2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">{t("clients.city")}</Label>
              <Input id="city" name="city" defaultValue={client?.city} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state">{t("clients.state")}</Label>
              <Input id="state" name="state" defaultValue={client?.state} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zip">{t("clients.zip")}</Label>
              <Input id="zip" name="zip" defaultValue={client?.zip} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">{t("clients.notes")}</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={client?.notes} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? t("clients.saveChanges") : t("clients.createClient")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
