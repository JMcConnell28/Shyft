import type { WorkspaceBoardMeta } from "@/features/rota/types/workspace"
import { getRotaPublicationLabel } from "@/features/rota/utils/rota-publication-label"

function RotaVersionLabel({
  meta,
  hasUnsavedChanges,
}: {
  meta: Pick<
    WorkspaceBoardMeta,
    "status" | "publishedVersion" | "hasUnpublishedChanges"
  >
  hasUnsavedChanges: boolean
}) {
  const editingStatus = hasUnsavedChanges
    ? "Unsaved changes"
    : meta.status === "published" && meta.hasUnpublishedChanges
      ? "Unpublished changes"
      : "Saved"

  return (
    <span className="text-[10px] font-semibold text-[#61709a]">
      {getRotaPublicationLabel(meta)} · {editingStatus}
    </span>
  )
}

export { RotaVersionLabel }
