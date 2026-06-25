import { AuthShell } from "@/components/auth-shell"
import { ForgotPasswordForm } from "@/components/forgot-password-form"
import { getT } from "@/lib/i18n/server"

export default async function ForgotPasswordPage() {
  const t = await getT()
  return (
    <AuthShell title={t("auth.forgotTitle")} description={t("auth.forgotDesc")}>
      <ForgotPasswordForm />
    </AuthShell>
  )
}
