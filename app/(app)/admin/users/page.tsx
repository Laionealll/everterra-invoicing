import { requireAdmin } from "@/lib/session"
import { getUsers } from "@/app/actions/users"
import { PageHeader } from "@/components/page-header"
import { UsersManager, type UserRow } from "@/components/users-manager"

export default async function AdminUsersPage() {
  const admin = await requireAdmin()
  const users = (await getUsers()) as UserRow[]

  return (
    <>
      <PageHeader
        title="Team members"
        description="Manage who can access the invoicing portal and their roles."
      />
      <div className="p-4 sm:p-8">
        <UsersManager users={users} currentUserId={admin.id} />
      </div>
    </>
  )
}
