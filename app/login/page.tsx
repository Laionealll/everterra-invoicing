import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { userCount } from "@/app/actions/users"
import { AuthShell } from "@/components/auth-shell"
import { LoginForm } from "@/components/login-form"

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")
  if ((await userCount()) === 0) redirect("/setup")

  return (
    <AuthShell
      title="Sign in"
      description="Access the Everterra invoicing portal."
      footer={<span>Authorized staff only. Contact an administrator for access.</span>}
    >
      <LoginForm />
    </AuthShell>
  )
}
