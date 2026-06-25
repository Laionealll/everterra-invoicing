import { requireAdmin } from "@/lib/session"
import { getUsers } from "@/app/actions/users"
import { PageHeader } from "@/components/page-header"
import { UsersManager, type UserRow } from "@/components/users-manager"
import { getT } from "@/lib/i18n/server"

export default async function AdminUsersPage() {
  const admin = await requireAdmin()
  const t = await getT()
  const users = (await getUsers()) as UserRow[]

  return (
    <>
      <PageHeader title={t("users.title")} description={t("users.desc")} />
      <div className="p-4 sm:p-8">
        <UsersManager users={users} currentUserId={admin.id} />
      </div>
    </>
  )
}
