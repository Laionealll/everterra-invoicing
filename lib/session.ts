import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const u = session.user as unknown as SessionUser & { role?: string }
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ?? "USER",
  }
}

// Alias used by page components.
export const getCurrentUser = getSessionUser

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== "ADMIN") redirect("/dashboard")
  return user
}
