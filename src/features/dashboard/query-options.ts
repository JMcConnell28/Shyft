import { queryOptions } from "@tanstack/react-query"
import type { z } from "zod"
import type { dashboardWelcomeWorkspaceSchema } from "@/features/dashboard/schemas/welcome-schemas"
import { getDashboardWelcome } from "@/features/dashboard/server-fns"

type WelcomeWorkspace = z.infer<typeof dashboardWelcomeWorkspaceSchema>

function dashboardWelcomeQueryOptions(
  workspace: WelcomeWorkspace,
  userId: string
) {
  return queryOptions({
    queryKey: [
      "dashboard-welcome",
      workspace.type,
      workspace.id,
      userId,
    ] as const,
    queryFn: () => getDashboardWelcome({ data: workspace }),
    staleTime: 5 * 60_000,
    retry: false,
  })
}

export { dashboardWelcomeQueryOptions }
