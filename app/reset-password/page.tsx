import { Suspense } from "react"
import { AuthShell } from "@/components/auth-shell"
import { ResetPasswordForm } from "@/components/reset-password-form"
import { getT } from "@/lib/i18n/server"

export default async function ResetPasswordPage() {
  const t = await getT()
  return (
    <AuthShell title={t("auth.resetTitle")} description={t("auth.resetDesc")}>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
