import { redirect } from "next/navigation"
import { userCount } from "@/app/actions/users"
import { AuthShell } from "@/components/auth-shell"
import { SetupForm } from "@/components/setup-form"

// Reads live database state (user count), so it must render per-request rather
// than be statically prerendered at build time (when no database is available).
export const dynamic = "force-dynamic"

export default async function SetupPage() {
  const count = await userCount()
  if (count > 0) redirect("/login")

  return (
    <AuthShell
      title="Welcome to Everterra Invoicing"
      description="Create the first administrator account to get started."
      footer={<span>This one-time setup is only available until the first account is made.</span>}
    >
      <SetupForm />
    </AuthShell>
  )
}
