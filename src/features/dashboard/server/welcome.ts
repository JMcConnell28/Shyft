import type { z } from "zod"

import { dashboardWelcomeWorkspaceSchema } from "@/features/dashboard/schemas/welcome-schemas"
import { requireVerifiedSessionOrThrow } from "@/features/onboarding/server/session"
import { getLocationRole } from "@/lib/auth/has-location-permission"
import { getOrganizationRole } from "@/lib/auth/has-org-permission"
import { getDatabase } from "@/lib/db"

type WelcomeWorkspace = z.infer<typeof dashboardWelcomeWorkspaceSchema>

async function getDashboardWelcomeState(workspace: WelcomeWorkspace) {
  const { session } = await requireVerifiedSessionOrThrow()
  await requireWorkspaceMembership(workspace, session.user.id)

  const result =
    workspace.type === "organization"
      ? await getDatabase().query<{ dismissed: boolean }>(
          `select exists (
             select 1 from public.workspace_welcome_dismissals
             where user_id = $1 and organization_id = $2
           ) as dismissed`,
          [session.user.id, workspace.id]
        )
      : await getDatabase().query<{ dismissed: boolean }>(
          `select exists (
             select 1 from public.workspace_welcome_dismissals
             where user_id = $1 and location_id = $2
           ) as dismissed`,
          [session.user.id, workspace.id]
        )

  return { shouldShow: !result.rows.at(0)?.dismissed }
}

async function dismissDashboardWelcome(workspace: WelcomeWorkspace) {
  const { session } = await requireVerifiedSessionOrThrow()
  await requireWorkspaceMembership(workspace, session.user.id)

  if (workspace.type === "organization") {
    await getDatabase().query(
      `insert into public.workspace_welcome_dismissals (user_id, organization_id)
       values ($1, $2)
       on conflict (user_id, organization_id)
         where organization_id is not null
       do update set dismissed_at = timezone('utc', now())`,
      [session.user.id, workspace.id]
    )
  } else {
    await getDatabase().query(
      `insert into public.workspace_welcome_dismissals (user_id, location_id)
       values ($1, $2)
       on conflict (user_id, location_id)
         where location_id is not null
       do update set dismissed_at = timezone('utc', now())`,
      [session.user.id, workspace.id]
    )
  }

  return { success: true }
}

async function requireWorkspaceMembership(
  workspace: WelcomeWorkspace,
  userId: string
) {
  const role =
    workspace.type === "organization"
      ? await getOrganizationRole(workspace.id, userId)
      : await getLocationRole(workspace.id, userId)

  if (!role) {
    throw new Error("You do not have access to this workspace.")
  }
}

export { dismissDashboardWelcome, getDashboardWelcomeState }
