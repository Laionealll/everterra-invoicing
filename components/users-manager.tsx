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
      toast.success("User created")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create user")
    } finally {
      setCreating(false)
    }
  }

  async function onRoleChange(id: string, role: string) {
    setPendingId(id)
    try {
      await setUserRole(id, role)
      toast.success("Role updated")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update role")
    } finally {
      setPendingId(null)
    }
  }

  async function onToggleActive(id: string, isActive: boolean) {
    setPendingId(id)
    try {
      await setUserActive(id, isActive)
      toast.success(isActive ? "User activated" : "User deactivated")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update status")
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
            New user
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>New user</DialogTitle>
              <DialogDescription>
                Create a team member account. They can sign in immediately.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={onCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Temporary password</Label>
                <Input id="password" name="password" type="password" minLength={8} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue="USER">
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating && <Loader2 className="size-4 animate-spin" />}
                  Create user
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => {
              const isSelf = u.id === currentUserId
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      onValueChange={(v) => onRoleChange(u.id, v)}
                      disabled={pendingId === u.id || isSelf}
                    >
                      <SelectTrigger className="h-8 w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge variant="secondary">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactive
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
                      {u.isActive ? "Deactivate" : "Activate"}
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
