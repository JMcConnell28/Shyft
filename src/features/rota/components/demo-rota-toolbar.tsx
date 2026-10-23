import {
  ChevronDown,
  FileDown,
  SaveIcon,
  Send,
  Settings,
  ShapesIcon,
} from "lucide-react"

import CreateShift from "./create-shift"
import RotaNotesDialog from "./rota-notes-dialog"
import { ToolBarFrame } from "./rota-toolbar-frame"
import ZonePicker from "./zone-picker"
import { Button } from "@/components/ui/button"
import {
  rotaToolbarButtonClassName,
  rotaToolbarIconButtonClassName,
  rotaToolbarPrimaryButtonClassName,
} from "@/features/rota/constants/rota-toolbar-styles"

export function DemoToolBar() {
  return (
    <ToolBarFrame
      actions={
        <>
          <div className="hidden md:contents">
            <DemoToolbarAction
              icon={FileDown}
              label="Export rota"
              text="Export"
            />
          </div>
          <DemoToolbarAction icon={SaveIcon} label="Save rota" text="Save" />
          <DemoToolbarAction
            icon={Send}
            label="Publish rota"
            text="Publish"
            primary
          />
          <div className="hidden md:contents">
            <DemoToolbarAction icon={Settings} label="Rota settings" />
          </div>
        </>
      }
      tools={
        <>
          <ZonePicker />
          <CreateShift />
          <div className="hidden md:contents">
            <Button
              type="button"
              variant="pill"
              size="icon"
              aria-label="Templates"
              className={rotaToolbarButtonClassName}
            >
              <ShapesIcon data-icon="inline-start" />
              Templates
              <ChevronDown className="size-3.5" />
            </Button>
          </div>
          <RotaNotesDialog mode="demo" />
        </>
      }
    />
  )
}

function DemoToolbarAction({
  icon: Icon,
  label,
  text,
  primary = false,
}: {
  icon: typeof FileDown
  label: string
  text?: string
  primary?: boolean
}) {
  return (
    <Button
      type="button"
      variant={primary ? "raised" : "pill"}
      size="icon"
      aria-label={label}
      className={
        primary
          ? rotaToolbarPrimaryButtonClassName
          : text
            ? rotaToolbarButtonClassName
            : rotaToolbarIconButtonClassName
      }
    >
      <Icon data-icon="inline-start" />
      {text ? <span className="hidden md:inline">{text}</span> : null}
    </Button>
  )
}
