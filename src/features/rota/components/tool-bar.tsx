import { LoaderCircle, SaveIcon, Send } from "lucide-react"
import { DemoToolBar } from "./demo-rota-toolbar"
import { MobileMoreMenu } from "./mobile-rota-more-menu"
import { ToolBarFrame } from "./rota-toolbar-frame"
import CreateShift from "./create-shift"
import RotaLifecycleMenu from "./rota-lifecycle-menu"
import RotaNotesDialog from "./rota-notes-dialog"
import { useRotaWorkspace } from "./rota-workspace-provider"
import { RotaExportDialog } from "./rota-export-dialog"
import { RotaTemplateMenu } from "./rota-template-menu"
import ZonePicker from "./zone-picker"
import {
  rotaToolbarButtonClassName,
  rotaToolbarPrimaryButtonClassName,
} from "@/features/rota/constants/rota-toolbar-styles"
import { usePublishRota } from "@/features/rota/hooks/use-publish-rota"
import { useSaveRotaWorkspace } from "@/features/rota/hooks/use-save-rota-workspace"
import { Button } from "@/components/ui/button"

function ToolBar({ mode = "default" }: { mode?: "default" | "demo" }) {
  return mode === "demo" ? <DemoToolBar /> : <ConnectedToolBar />
}

function ConnectedToolBar() {
  const { meta } = useRotaWorkspace()
  const { canSave, isSaving, save, saveBlockedReason } = useSaveRotaWorkspace()
  const { canPublish, isPublishing, publish, publishBlockedReason } =
    usePublishRota()
  const canEdit = meta.canEdit

  return (
    <ToolBarFrame
      actions={
        <>
          <div className="hidden md:block">
            <RotaExportDialog />
          </div>
          {canEdit ? (
            <>
              <Button
                variant="pill"
                size="icon"
                disabled={!canSave}
                onClick={() => {
                  void save()
                }}
                title={saveBlockedReason ?? undefined}
                aria-label="Save rota"
                className={rotaToolbarButtonClassName}
              >
                {isSaving ? (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <SaveIcon data-icon="inline-start" />
                )}
                <span className="hidden md:inline">Save</span>
              </Button>
              <Button
                variant="raised"
                size="icon"
                className={rotaToolbarPrimaryButtonClassName}
                disabled={!canPublish}
                onClick={() => {
                  void publish()
                }}
                title={publishBlockedReason ?? undefined}
                aria-label={
                  meta.status === "published"
                    ? "Republish rota"
                    : "Publish rota"
                }
              >
                {isPublishing ? (
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                ) : (
                  <Send data-icon="inline-start" />
                )}
                <span className="hidden md:inline">
                  {meta.status === "published" ? "Republish" : "Publish"}
                </span>
              </Button>
              <div className="hidden md:block">
                <RotaLifecycleMenu />
              </div>
            </>
          ) : null}
          <MobileMoreMenu
            canEdit={canEdit}
            isSaving={isSaving}
            saveCurrentRota={save}
            saveButton={
              canEdit ? (
                <Button
                  variant="pill"
                  disabled={!canSave}
                  onClick={() => {
                    void save()
                  }}
                  title={saveBlockedReason ?? undefined}
                  className="w-full justify-start gap-2 rounded-lg"
                >
                  {isSaving ? (
                    <LoaderCircle
                      data-icon="inline-start"
                      className="animate-spin"
                    />
                  ) : (
                    <SaveIcon data-icon="inline-start" />
                  )}
                  Save rota
                </Button>
              ) : null
            }
          />
        </>
      }
      tools={
        <>
          <ZonePicker />
          {meta.canEdit ? <CreateShift /> : null}
          {meta.canEdit ? (
            <div className="hidden md:contents">
              <RotaTemplateMenu isSaving={isSaving} saveCurrentRota={save} />
              <RotaNotesDialog />
            </div>
          ) : null}
        </>
      }
    />
  )
}

export default ToolBar
