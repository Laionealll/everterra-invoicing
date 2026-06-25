import { redirect } from "next/navigation"
import { userCount } from "@/app/actions/users"
import { AuthShell } from "@/components/auth-shell"
import { SetupForm } from "@/components/setup-form"
import { getT } from "@/lib/i18n/server"

// Reads live database state (user count), so it must render per-request rather
// than be statically prerendered at build time (when no database is available).
export const dynamic = "force-dynamic"

export default async function SetupPage() {
  const count = await userCount()
  if (count > 0) redirect("/login")

  const t = await getT()

  return (
    <AuthShell
      title={t("auth.setupTitle")}
      description={t("auth.setupDesc")}
      footer={<span>{t("auth.setupFooter")}</span>}
    >
      <SetupForm />
    </AuthShell>
  )
}
