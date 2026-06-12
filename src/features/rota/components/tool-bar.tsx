import * as React from "react"
import {
  ChevronDown,
  CircleDotIcon,
  FileDown,
  LoaderCircle,
  NotepadTextIcon,
  Plus,
  SaveIcon,
  Send,
  Settings,
  ShapesIcon,
} from "lucide-react"
import CreateShift from "./create-shift"
import RotaLifecycleMenu from "./rota-lifecycle-menu"
import RotaNotesDialog from "./rota-notes-dialog"
import { RotaExportDialog } from "./rota-export-dialog"
import { RotaTemplateMenu } from "./rota-template-menu"
import ZonePicker from "./zone-picker"
import { usePublishRota } from "@/features/rota/hooks/use-publish-rota"
import { useSaveRotaWorkspace } from "@/features/rota/hooks/use-save-rota-workspace"
import { useRotaWorkspace } from "./rota-workspace-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function ToolBar({ mode = "default" }: { mode?: "default" | "demo" }) {
  return mode === "demo" ? <DemoToolBar /> : <ConnectedToolBar />
}

function ConnectedToolBar() {
  const { meta } = useRotaWorkspace()
  const { canSave, isSaving, save, saveBlockedReason } = useSaveRotaWorkspace()
  const { canPublish, isPublishing, publish, publishBlockedReason } =
    usePublishRota()

  return (
    <ToolBarFrame
      actions={
        <>
          <RotaExportDialog />
          <Button
            variant="pill"
            size="icon"
            disabled={!canSave}
            onClick={() => {
              void save()
            }}
            title={saveBlockedReason ?? undefined}
            aria-label="Save rota"
            className="md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            {isSaving ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <SaveIcon data-icon="inline-start" />
            )}
            <span className="hidden md:inline">Save</span>
          </Button>
          <Button
            variant="raised"
            size="icon"
            className="border-emerald-700 bg-emerald-600 hover:bg-emerald-700 focus-visible:border-emerald-800 focus-visible:ring-emerald-500/30 md:h-7 md:w-auto md:gap-2 md:px-2"
            disabled={!canPublish}
            onClick={() => {
              void publish()
            }}
            title={publishBlockedReason ?? undefined}
            aria-label={meta.status === "published" ? "Republish rota" : "Publish rota"}
          >
            {isPublishing ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            <span className="hidden md:inline">
              {meta.status === "published" ? "Republish" : "Publish"}
            </span>
          </Button>
          <RotaLifecycleMenu />
        </>
      }
      tools={
        <>
          <ZonePicker />
          <CreateShift />
          {/* <RotaCopyMenu /> */}
          <RotaTemplateMenu isSaving={isSaving} saveCurrentRota={save} />
          <RotaNotesDialog />
        </>
      }
    />
  )
}

function DemoToolBar() {
  return (
    <ToolBarFrame
      actions={
        <>
          <Button
            variant="pill"
            size="icon"
            aria-label="Export rota"
            title="Demo only"
            className="md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            <FileDown data-icon="inline-start" />
            <span className="hidden md:inline">Export</span>
          </Button>
          <Button
            variant="pill"
            size="icon"
            title="Demo changes reset on refresh."
            aria-label="Save rota"
            className="md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            <SaveIcon data-icon="inline-start" />
            <span className="hidden md:inline">Save</span>
          </Button>
          <Button
            variant="raised"
            size="icon"
            className="border-emerald-700 bg-emerald-600 hover:bg-emerald-700 focus-visible:border-emerald-800 focus-visible:ring-emerald-500/30 md:h-7 md:w-auto md:gap-2 md:px-2"
            title="Demo only"
            aria-label="Publish rota"
          >
            <Send data-icon="inline-start" />
            <span className="hidden md:inline">Publish</span>
          </Button>
          <Button
            variant="pill"
            size="icon"
            title="Demo only"
            aria-label="Rota settings"
          >
            <Settings data-icon="inline-start" />
          </Button>
        </>
      }
      tools={
        <>
          <Button
            type="button"
            variant="pill"
            size="icon"
            aria-label="All zones"
            title="Demo only"
            className="md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            <span className="hidden md:inline">All zones</span>
            <ChevronDown className="hidden size-3.5 md:block" />
          </Button>
          <Button
            type="button"
            variant="raised"
            size="icon"
            aria-label="Create shift"
            title="Demo only"
            className="border-emerald-700 bg-emerald-600 hover:bg-emerald-700 focus-visible:border-emerald-800 focus-visible:ring-emerald-500/30 md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            <Plus data-icon="inline-start" />
            <span className="hidden md:inline">New shift</span>
          </Button>
          <Button
            type="button"
            variant="pill"
            size="icon"
            aria-label="Templates"
            title="Demo only"
            className="md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            <ShapesIcon className="size-3.5" />
            <span className="hidden md:inline">Templates</span>
            <ChevronDown className="hidden size-3.5 md:block" />
          </Button>
          <Button
            type="button"
            variant="pill"
            size="icon"
            aria-label="Staff notes"
            title="Demo only"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 md:h-7 md:w-auto md:gap-2 md:px-2"
          >
            <NotepadTextIcon data-icon="inline-start" />
            <span className="hidden md:inline">Notes</span>
            <CircleDotIcon className="size-3.5 fill-current" />
          </Button>
        </>
      }
    />
  )
}

function ToolBarFrame({
  actions,
  tools,
}: {
  actions: React.ReactNode
  tools: React.ReactNode
}) {
  const { days, meta, selectedLocation } = useRotaWorkspace()
  const weekRangeLabel = getWeekRangeLabel(days)
  const status = meta.status

  return (
    <div className="flex w-full shrink-0 flex-col gap-2 px-1 md:h-10 md:flex-row md:items-center md:gap-3 md:px-2">
      <div className="w-full shrink-0 md:w-64">
        <div className="flex w-full min-w-0 flex-col justify-center rounded-xl bg-card px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">
              {selectedLocation?.name ?? "Location"}
            </span>
            <Badge
              variant="outline"
              className={getStatusBadgeClassName(status)}
            >
              <span
                aria-hidden="true"
                className={getStatusDotClassName(status)}
              />
              {getStatusLabel(status)}
            </Badge>
            {status === "published" && meta.hasUnpublishedChanges ? (
              <Badge
                variant="outline"
                className="hidden border-amber-200/80 bg-amber-50/90 text-[10px] font-semibold tracking-[0.08em] text-amber-700 uppercase shadow-sm shadow-amber-100/70 sm:inline-flex"
              >
                Changes not live
              </Badge>
            ) : null}
          </div>
          <span className="text-xs text-muted-foreground">
            {weekRangeLabel}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden">
        <div className="no-scrollbar flex min-w-0 items-center gap-2 overflow-x-auto">
          {tools}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      </div>
    </div>
  )
}

function getWeekRangeLabel(days: ReturnType<typeof useRotaWorkspace>["days"]) {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]

  if (!firstDay || !lastDay) {
    return "Week"
  }

  if (firstDay.monthLabel === lastDay.monthLabel) {
    return `${firstDay.dayNumber} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
  }

  return `${firstDay.dayNumber} ${firstDay.monthLabel} - ${lastDay.dayNumber} ${lastDay.monthLabel}`
}

function getStatusBadgeClassName(status: "draft" | "published") {
  return status === "published"
    ? "gap-1.5 rounded-full border-emerald-200/80 bg-emerald-50/80 px-2.5 text-[10px] font-semibold tracking-[0.08em] text-emerald-700 uppercase shadow-sm shadow-emerald-100/60"
    : "gap-1.5 rounded-full border-amber-200/80 bg-amber-50/90 px-2.5 text-[10px] font-semibold tracking-[0.08em] text-amber-700 uppercase shadow-sm shadow-amber-100/70"
}

function getStatusDotClassName(status: "draft" | "published") {
  return status === "published"
    ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
    : "h-1.5 w-1.5 rounded-full bg-amber-500"
}

function getStatusLabel(status: "draft" | "published") {
  return status === "published" ? "Published" : "Draft"
}

export default ToolBar
