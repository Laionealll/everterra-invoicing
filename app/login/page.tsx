import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/session"
import { userCount } from "@/app/actions/users"
import { AuthShell } from "@/components/auth-shell"
import { LoginForm } from "@/components/login-form"
import { getT } from "@/lib/i18n/server"

export default async function LoginPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")
  if ((await userCount()) === 0) redirect("/setup")

  const t = await getT()

  return (
    <AuthShell
      title={t("auth.signInTitle")}
      description={t("auth.signInDesc")}
      footer={<span>{t("auth.signInFooter")}</span>}
    >
      <LoginForm />
    </AuthShell>
  )
}
