import type { WorkspaceViewerInput } from "@/features/navigation/schemas/navigation-schemas"

const navigationQueryKeys = {
  all: ["navigation"] as const,
  session: ["navigation", "session"] as const,
  viewers: ["navigation", "workspace"] as const,
  workspace: (input: WorkspaceViewerInput) =>
    [...navigationQueryKeys.viewers, input] as const,
}

export { navigationQueryKeys }
