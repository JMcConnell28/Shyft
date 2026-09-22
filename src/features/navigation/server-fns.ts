import { createServerFn } from "@tanstack/react-start"

import { workspaceViewerInputSchema } from "@/features/navigation/schemas/navigation-schemas"

const getNavigationSession = createServerFn({ method: "GET" }).handler(
  async () => {
    const { readNavigationSession } =
      await import("@/features/navigation/server/navigation-session")
    return readNavigationSession()
  }
)

const getWorkspaceViewer = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => workspaceViewerInputSchema.parse(input))
  .handler(async ({ data }) => {
    const { readWorkspaceViewer } =
      await import("@/features/navigation/server/workspace-viewer")
    return readWorkspaceViewer(data)
  })

export { getNavigationSession, getWorkspaceViewer }
