import "@tanstack/react-start/server-only"

import { queryMany } from "@rocketrota/db"

import type { AdminUserSearchResult, UsersPageData } from "@/features/users/types"

type UserRow = {
  deactivated_at: Date | string | null
  email: string
  emailVerified: boolean
  id: string
  last_login_at: Date | string | null
  name: string
  role_summary: string | null
}

async function searchAppUsers(input: { search?: string }): Promise<UsersPageData> {
  const rows = await queryMany<UserRow>(
    `select app_user.id,
            app_user.name,
            app_user.email,
            app_user."emailVerified",
            max(session."createdAt") as last_login_at,
            case
              when status_override.status = 'deactivated'
              then status_override.updated_at
              else null
            end as deactivated_at,
            string_agg(distinct coalesce(location_member.role, org_member.role), ', ') as role_summary
     from public."user" app_user
     left join public."session" session
       on session."userId" = app_user.id
     left join public.location_memberships location_member
       on location_member.user_id = app_user.id
     left join public."member" org_member
       on org_member."userId" = app_user.id
     left join admin_private.app_user_status_overrides status_override
       on status_override.user_id = app_user.id
     where $1::text is null
        or app_user.email ilike '%' || $1 || '%'
        or app_user.name ilike '%' || $1 || '%'
     group by app_user.id,
              app_user.name,
              app_user.email,
              app_user."emailVerified",
              status_override.updated_at,
              status_override.status
     order by max(session."createdAt") desc nulls last, app_user."createdAt" desc
     limit 100`,
    [input.search || null],
  )

  return {
    users: rows.map(mapUser),
  }
}

function mapUser(row: UserRow): AdminUserSearchResult {
  return {
    deactivatedAt: row.deactivated_at
      ? new Date(row.deactivated_at).toISOString()
      : null,
    email: row.email,
    emailVerified: row.emailVerified,
    id: row.id,
    lastLoginAt: row.last_login_at
      ? new Date(row.last_login_at).toISOString()
      : null,
    name: row.name,
    roleSummary: row.role_summary ?? "No roles",
  }
}

export { searchAppUsers }
