import { CameraIcon, RotateCcwIcon } from "lucide-react"

import type { useDemoPageControls } from "@/features/rota-demo/hooks/use-demo-page-controls"
import {
  DEMO_MAX_EMPLOYEE_COUNT,
  demoEmployeePresets,
} from "@/features/rota-demo/constants/demo-settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function DemoPageControls({
  controls,
}: {
  controls: ReturnType<typeof useDemoPageControls>
}) {
  return (
    <header className="shrink-0 border-b bg-card px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-sm font-bold">
            Harbour House{" "}
            <span className="ml-2 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
              Local demo
            </span>
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Fictional staff. All changes reset on refresh. No emails, saving or
            publishing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form
            className="flex items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              controls.applyCount()
            }}
          >
            <Label htmlFor="demo-employee-count">Employees</Label>
            <Input
              id="demo-employee-count"
              type="number"
              min={0}
              max={DEMO_MAX_EMPLOYEE_COUNT}
              step={1}
              value={controls.countInput}
              onChange={(event) => controls.setCountInput(event.target.value)}
              aria-invalid={Boolean(controls.error)}
              aria-describedby={controls.error ? "demo-count-error" : undefined}
              className="h-8 w-20"
            />
            <Button type="submit" variant="outline" className="h-8">
              Apply
            </Button>
          </form>
          <Button
            variant="outline"
            className="h-8"
            onClick={controls.resetDemo}
          >
            <RotateCcwIcon />
            Reset
          </Button>
          <Button
            variant="outline"
            className="h-8"
            onClick={() => controls.setScreenshotView(true)}
          >
            <CameraIcon />
            Screenshot view
          </Button>
        </div>
      </div>
      <div
        className="mt-2 flex flex-wrap items-center gap-1.5"
        aria-label="Employee count presets"
      >
        {demoEmployeePresets.map((count) => (
          <Button
            key={count}
            variant={controls.employeeCount === count ? "secondary" : "ghost"}
            size="sm"
            className="h-6 px-2 text-[11px]"
            aria-pressed={controls.employeeCount === count}
            onClick={() => controls.applyCount(String(count))}
          >
            {count}
          </Button>
        ))}
        <p className="ml-2 text-[10px] text-muted-foreground">
          Lower counts hide extra staff and their assignments. Screenshot view
          hides these controls; press Escape to return.
        </p>
      </div>
      {controls.error ? (
        <p
          id="demo-count-error"
          role="alert"
          className="mt-1 text-xs text-destructive"
        >
          {controls.error}
        </p>
      ) : null}
    </header>
  )
}
