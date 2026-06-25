import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getSettings, type SettingsInput } from "@/app/actions/settings"
import { PageHeader } from "@/components/page-header"
import { SettingsForm } from "@/components/settings-form"
import { getT } from "@/lib/i18n/server"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const t = await getT()
  const settings = (await getSettings()) as SettingsInput

  return (
    <>
      <PageHeader title={t("settings.title")} description={t("settings.desc")} />
      <div className="p-4 sm:p-8">
        <div className="mx-auto w-full max-w-3xl">
          <SettingsForm settings={settings} />
        </div>
      </div>
    </>
  )
}
