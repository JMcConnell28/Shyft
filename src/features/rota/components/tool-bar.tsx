import * as React from "react"
import {
  ChevronDown,
  CircleDotIcon,
  FileDown,
  LoaderCircle,
  MoreHorizontalIcon,
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
import { useRotaWorkspace } from "./rota-workspace-provider"
import { RotaExportDialog } from "./rota-export-dialog"
import { RotaTemplateMenu } from "./rota-template-menu"
import ZonePicker from "./zone-picker"
import {
  rotaToolbarButtonClassName,
  rotaToolbarIconButtonClassName,
  rotaToolbarPrimaryButtonClassName,
} from "@/features/rota/constants/rota-toolbar-styles"
import { usePublishRota } from "@/features/rota/hooks/use-publish-rota"
import { useSaveRotaWorkspace } from "@/features/rota/hooks/use-save-rota-workspace"
import { canExportSageTimesheetForRota } from "@/features/rota/utils/week-utils"
import { SageTimesheetExportButton } from "@/features/timesheets/components/sage-timesheet-export-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

function ToolBar({ mode = "default" }: { mode?: "default" | "demo" }) {
  return mode === "demo" ? <DemoToolBar /> : <ConnectedToolBar />
}

function ConnectedToolBar() {
  const { meta, selectedLocation } = useRotaWorkspace()
  const { canSave, isSaving, save, saveBlockedReason } = useSaveRotaWorkspace()
  const { canPublish, isPublishing, publish, publishBlockedReason } =
    usePublishRota()
  const canEdit = meta.canEdit
  const canExportSage = meta.canManage && canExportSageTimesheetForRota(meta)
  const sageExportInput = {
    organizationId: meta.organizationId,
    locationId:
      meta.workspaceType === "location" ? selectedLocation.id : undefined,
    userId: meta.userId,
  }

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
            sageExportButton={
              canExportSage ? (
                <SageTimesheetExportButton
                  input={sageExportInput}
                  rotaId={meta.rotaId}
                  variant="pill"
                  className="w-full justify-start gap-2 rounded-lg"
                />
              ) : null
            }
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
          {/* <RotaCopyMenu /> */}
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
            className={rotaToolbarButtonClassName}
          >
            <FileDown data-icon="inline-start" />
            <span className="hidden md:inline">Export</span>
          </Button>
          <Button
            variant="pill"
            size="icon"
            title="Demo changes reset on refresh."
            aria-label="Save rota"
            className={rotaToolbarButtonClassName}
          >
            <SaveIcon data-icon="inline-start" />
            <span className="hidden md:inline">Save</span>
          </Button>
          <Button
            variant="raised"
            size="icon"
            className={rotaToolbarPrimaryButtonClassName}
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
            className={rotaToolbarIconButtonClassName}
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
            className={rotaToolbarButtonClassName}
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
            className={rotaToolbarPrimaryButtonClassName}
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
            className={rotaToolbarButtonClassName}
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
            className={rotaToolbarButtonClassName}
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
    <div className="flex w-full shrink-0 flex-col gap-2 md:h-10 md:flex-row md:items-center md:gap-3 md:px-2">
      <div className="w-full shrink-0 md:w-64">
        <div className="flex w-full min-w-0 flex-col justify-center rounded-xl bg-white px-3 py-2 shadow-[0_6px_18px_rgba(30,50,96,0.05)] ring-1 ring-[#e7eaf2] sm:bg-transparent md:shadow-none md:ring-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-extrabold tracking-[-0.025em] text-[#11245a] md:font-semibold md:tracking-normal md:text-foreground">
              {selectedLocation.name}
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
          <span className="mt-0.5 text-xs font-semibold text-[#61709a] md:mt-0 md:font-normal md:text-muted-foreground">
            {weekRangeLabel}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden">
        <div className="no-scrollbar flex min-w-0 items-center gap-1.5 overflow-x-auto p-px">
          {tools}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      </div>
    </div>
  )
}

function MobileMoreMenu({
  canEdit,
  isSaving,
  sageExportButton,
  saveButton,
  saveCurrentRota,
}: {
  canEdit: boolean
  isSaving: boolean
  sageExportButton: React.ReactNode
  saveButton: React.ReactNode
  saveCurrentRota: () => Promise<void>
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="pill"
            size="icon"
            aria-label="More rota actions"
            className={`${rotaToolbarIconButtonClassName} md:hidden`}
          />
        }
      >
        <MoreHorizontalIcon className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="group/toolbar-more w-56 gap-2 rounded-xl p-2"
        data-toolbar-more="true"
      >
        <PopoverHeader className="px-2 pt-1">
          <PopoverTitle className="text-xs font-extrabold text-[#11245a]">
            Rota actions
          </PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-1 [&_button]:h-9 [&_button]:w-full [&_button]:justify-start [&_button]:gap-2 [&_button]:rounded-lg [&_button]:border-0 [&_button]:bg-transparent [&_button]:px-2.5 [&_button]:text-xs [&_button]:font-bold [&_button]:shadow-none [&_button:hover]:bg-[#f5f7ff]">
          {saveButton}
          <RotaExportDialog />
          {sageExportButton}
          {canEdit ? (
            <>
              <RotaTemplateMenu
                isSaving={isSaving}
                saveCurrentRota={saveCurrentRota}
              />
              <RotaNotesDialog />
              <RotaLifecycleMenu />
            </>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function getWeekRangeLabel(days: ReturnType<typeof useRotaWorkspace>["days"]) {
  const firstDay = days[0]
  const lastDay = days[days.length - 1]

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
