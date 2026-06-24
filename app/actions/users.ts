"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { user as userTable } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/session"
import { desc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function userCount(): Promise<number> {
  const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(userTable)
  return row?.count ?? 0
}

export async function createFirstAdmin(input: {
  name: string
  email: string
  password: string
}) {
  const count = await userCount()
  if (count > 0) throw new Error("Setup has already been completed")
  if (!input.name?.trim()) throw new Error("Name is required")
  if (!input.email?.trim()) throw new Error("Email is required")
  if (!input.password || input.password.length < 8)
    throw new Error("Password must be at least 8 characters")

  const created = await auth.api.signUpEmail({
    body: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
    headers: await headers(),
  })
  if (created?.user?.id) {
    await db
      .update(userTable)
      .set({ role: "ADMIN", updatedAt: new Date() })
      .where(eq(userTable.id, created.user.id))
  }
  return { id: created?.user?.id }
}

export async function getUsers() {
  await requireAdmin()
  return db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      isActive: userTable.isActive,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt))
}

export async function createUser(input: {
  name: string
  email: string
  password: string
  role: string
}) {
  await requireAdmin()
  if (!input.name?.trim()) throw new Error("Name is required")
  if (!input.email?.trim()) throw new Error("Email is required")
  if (!input.password || input.password.length < 8)
    throw new Error("Password must be at least 8 characters")

  // Create via Better Auth so the password is hashed and an account row is made.
  const created = await auth.api.signUpEmail({
    body: {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
    },
    headers: await headers(),
  })

  // Apply the chosen role (sign-up defaults to USER).
  if (input.role === "ADMIN" && created?.user?.id) {
    await db
      .update(userTable)
      .set({ role: "ADMIN", updatedAt: new Date() })
      .where(eq(userTable.id, created.user.id))
  }
  revalidatePath("/admin/users")
  return { id: created?.user?.id }
}

export async function setUserRole(id: string, role: string) {
  const admin = await requireAdmin()
  if (!["ADMIN", "USER"].includes(role)) throw new Error("Invalid role")
  if (id === admin.id && role !== "ADMIN")
    throw new Error("You cannot remove your own admin access")
  await db.update(userTable).set({ role, updatedAt: new Date() }).where(eq(userTable.id, id))
  revalidatePath("/admin/users")
}

export async function setUserActive(id: string, isActive: boolean) {
  const admin = await requireAdmin()
  if (id === admin.id && !isActive) throw new Error("You cannot deactivate your own account")
  await db
    .update(userTable)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(userTable.id, id))
  revalidatePath("/admin/users")
}
