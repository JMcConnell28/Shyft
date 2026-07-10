import { createServerFn } from "@tanstack/react-start"

const getWorkspacesPageData = createServerFn({ method: "GET" }).handler(
  async () => {
    const { requireAdminPermission } = await import(
      "@/features/auth/server/admin-session"
    )
    const { listWorkspaces } = await import(
      "@/features/workspaces/server/queries"
    )

    await requireAdminPermission("workspaces.read")
    return listWorkspaces()
  },
)

export { getWorkspacesPageData }
