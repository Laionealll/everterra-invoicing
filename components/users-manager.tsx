"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUser, setUserActive, setUserRole } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { formatDate } from "@/lib/format"
import { useI18n } from "@/components/i18n-provider"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

export type UserRow = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: Date | string
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: UserRow[]
  currentUserId: string
}) {
  const router = useRouter()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)

  async function onCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setCreating(true)
    try {
      await createUser({
        name: String(fd.get("name") || ""),
        email: String(fd.get("email") || ""),
        password: String(fd.get("password") || ""),
        role: String(fd.get("role") || "USER"),
      })
      toast.success(t("users.created"))
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("users.createError"))
    } finally {
      setCreating(false)
    }
  }

  async function onRoleChange(id: string, role: string) {
    setPendingId(id)
    try {
      await setUserRole(id, role)
      toast.success(t("users.roleUpdated"))
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("users.roleError"))
    } finally {
      setPendingId(null)
    }
  }

  async function onToggleActive(id: string, isActive: boolean) {
    setPendingId(id)
    try {
      await setUserActive(id, isActive)
      toast.success(isActive ? t("users.activated") : t("users.deactivated"))
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("users.statusError"))
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="size-4" />
            {t("users.newUser")}
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("users.newUser")}</DialogTitle>
              <DialogDescription>{t("users.newUserDesc")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={onCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">{t("users.fullName")}</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("users.email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">{t("users.tempPassword")}</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">{t("users.role")}</Label>
                <Select name="role" defaultValue="USER">
                  <SelectTrigger id="role">
                    <SelectValue>{(value: string) => t(value === "ADMIN" ? "users.roleAdmin" : "users.roleUser")}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">{t("users.roleUser")}</SelectItem>
                    <SelectItem value="ADMIN">{t("users.roleAdmin")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  {t("users.createUser")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("users.colName")}</TableHead>
              <TableHead>{t("users.colEmail")}</TableHead>
              <TableHead>{t("users.colRole")}</TableHead>
              <TableHead>{t("users.colStatus")}</TableHead>
              <TableHead>{t("users.colJoined")}</TableHead>
              <TableHead className="text-right">{t("users.colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">({t("common.you")})</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => onRoleChange(u.id, v)}
                      disabled={pendingId === u.id || isSelf}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue>{(value: string) => t(value === "ADMIN" ? "users.roleAdmin" : "users.roleUser")}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">{t("users.roleUser")}</SelectItem>
                        <SelectItem value="ADMIN">{t("users.roleAdmin")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge variant="secondary">{t("users.active")}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        {t("users.inactive")}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={pendingId === u.id || isSelf}
                      onClick={() => onToggleActive(u.id, !u.isActive)}
                    >
                      {u.isActive ? t("users.deactivate") : t("users.activate")}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
