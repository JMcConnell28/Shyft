import { SaveIcon, Send, Settings } from "lucide-react"

import CreateShift from "./create-shift"
import LocationPicker from "./location-picker"
import ZonePicker from "./zone-picker"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function ToolBar() {
  return (
    <div className="flex h-10 w-full shrink-0 items-center gap-3 px-2">
      <div className="w-64 shrink-0">
        <LocationPicker />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ZonePicker />
          <CreateShift />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" disabled>
            <SaveIcon data-icon="inline-start" />
            Save
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700" disabled>
            <Send data-icon="inline-start" />
            Publish
          </Button>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="outline" size="icon" disabled>
                  <Settings data-icon="inline-start" />
                </Button>
              }
            >
              <TooltipContent>
                <p>Publish and settings will connect once real rota data is wired in.</p>
              </TooltipContent>
            </TooltipTrigger>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default ToolBar
