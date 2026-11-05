import type { WorkspaceSettingsInput } from "@/features/settings/query-options"
import { requireWorkspaceWriteAccess } from "@/features/billing/server/workspace-write-access"
import { requireLocationPermission } from "@/lib/auth/has-location-permission"
import { requireOrgPermission } from "@/lib/auth/has-org-permission"

async function requireSettingsLocationWriteAccess(
  input: WorkspaceSettingsInput,
  action: "create" | "update"
): Promise<void> {
  if (!input.organizationId && !input.locationId)
    throw new Error("Choose a location.")
  const permissions = { location: [action] }
  const errorMessage =
    action === "create"
      ? "You do not have permission to create locations."
      : "You do not have permission to manage zones."
  await Promise.all([
    requireWorkspaceWriteAccess(input),
    input.organizationId
      ? requireOrgPermission({
          organizationId: input.organizationId,
          userId: input.userId,
          permissions,
          errorMessage,
        })
      : requireLocationPermission({
          locationId: input.locationId ?? "",
          userId: input.userId,
          permissions,
          errorMessage,
        }),
  ])
}

export { requireSettingsLocationWriteAccess }
