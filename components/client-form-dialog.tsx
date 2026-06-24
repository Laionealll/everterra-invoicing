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
      toast.error("Client name is required")
      return
    }
    setLoading(true)
    try {
      if (isEdit && client?.id) {
        await updateClient(client.id, input)
        toast.success("Client updated")
      } else {
        await createClient(input)
        toast.success("Client created")
      }
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit client" : "New client"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this client's details." : "Add a client to bill on invoices."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Company / Client name *</Label>
            <Input id="name" name="name" required defaultValue={client?.name} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactName">Contact name</Label>
              <Input id="contactName" name="contactName" defaultValue={client?.contactName} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={client?.phone} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={client?.email} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addressLine1">Address</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder="Street address"
              defaultValue={client?.addressLine1}
            />
            <Input
              name="addressLine2"
              placeholder="Suite, unit, etc. (optional)"
              defaultValue={client?.addressLine2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={client?.city} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" defaultValue={client?.state} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input id="zip" name="zip" defaultValue={client?.zip} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} defaultValue={client?.notes} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "Save changes" : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
