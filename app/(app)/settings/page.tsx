import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getSettings, type SettingsInput } from "@/app/actions/settings"
import { PageHeader } from "@/components/page-header"
import { SettingsForm } from "@/components/settings-form"

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "ADMIN") redirect("/dashboard")

  const settings = (await getSettings()) as SettingsInput

  return (
    <>
      <PageHeader
        title="Company settings"
        description="Manage the company identity, payment details, and invoice defaults."
      />
      <div className="p-4 sm:p-8">
        <div className="mx-auto w-full max-w-3xl">
          <SettingsForm settings={settings} />
        </div>
      </div>
    </>
  )
}
