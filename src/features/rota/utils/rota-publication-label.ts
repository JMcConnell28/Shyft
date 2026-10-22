import type { WorkspaceBoardMeta } from "@/features/rota/types/workspace"

function getRotaPublicationLabel(
  meta: Pick<WorkspaceBoardMeta, "status" | "publishedVersion">
): string {
  return meta.status === "published"
    ? `Published v${meta.publishedVersion}`
    : "Draft"
}

export { getRotaPublicationLabel }
