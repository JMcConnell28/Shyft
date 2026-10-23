import { DemoPageControls } from "./demo-page-controls"
import { standaloneDemoBoard } from "@/features/rota-demo/data/standalone-demo-board"
import { useDemoPageControls } from "@/features/rota-demo/hooks/use-demo-page-controls"
import RotaWorkspace from "@/features/rota/components/rota-workspace"
import { Button } from "@/components/ui/button"
import "../styles/demo-rota-page.css"

export function DemoRotaPage() {
  const controls = useDemoPageControls()

  return (
    <div
      className="flex h-svh min-h-0 flex-col overflow-hidden bg-background"
      data-demo-screenshot={controls.screenshotView}
    >
      {!controls.screenshotView ? (
        <DemoPageControls controls={controls} />
      ) : null}
      <main
        aria-label="Harbour House demo rota"
        className="flex min-h-0 flex-1 flex-col"
      >
        <RotaWorkspace
          key={controls.revision}
          boardData={standaloneDemoBoard}
          demoEmployees={controls.employees}
          mode="demo"
          showSummary
        />
      </main>
      {controls.screenshotView ? (
        <Button
          className="demo-screenshot-exit fixed right-3 bottom-3"
          onClick={() => controls.setScreenshotView(false)}
        >
          Show demo controls
        </Button>
      ) : null}
    </div>
  )
}
