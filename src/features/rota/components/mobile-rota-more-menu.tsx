import { MoreHorizontalIcon } from "lucide-react"

import RotaLifecycleMenu from "./rota-lifecycle-menu"
import RotaNotesDialog from "./rota-notes-dialog"
import { RotaExportDialog } from "./rota-export-dialog"
import { RotaTemplateMenu } from "./rota-template-menu"
import type { ReactNode } from "react"
import { rotaToolbarIconButtonClassName } from "@/features/rota/constants/rota-toolbar-styles"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

function MobileMoreMenu({
  canEdit,
  isSaving,
  saveButton,
  saveCurrentRota,
}: {
  canEdit: boolean
  isSaving: boolean
  saveButton: ReactNode
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

export { MobileMoreMenu }
