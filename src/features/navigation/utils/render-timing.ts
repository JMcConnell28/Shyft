import type { ProfilerOnRenderCallback } from "react"

let renderDurationMs = 0

const recordWorkspaceRender: ProfilerOnRenderCallback = (
  _id,
  _phase,
  duration
) => {
  renderDurationMs += duration
}

function resetRenderTiming(): void {
  renderDurationMs = 0
}

function getRenderTiming(): number {
  return Math.round(renderDurationMs * 10) / 10
}

export { getRenderTiming, recordWorkspaceRender, resetRenderTiming }
