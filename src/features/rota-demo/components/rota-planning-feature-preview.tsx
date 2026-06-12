"use client"

import * as React from "react"

import RotaWorkspace from "@/features/rota/components/rota-workspace"
import { demoRotaBoardData } from "@/features/rota-demo/data/demo-rota-board"

function RotaPlanningFeaturePreview() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-[430px] overflow-hidden bg-background sm:h-[500px] lg:h-[540px]">
      <div className="h-[680px] w-[1080px] origin-top-left scale-[0.58] sm:scale-[0.66] lg:scale-[0.62] xl:scale-[0.7]">
        {mounted ? (
          <RotaWorkspace boardData={demoRotaBoardData} mode="demo" />
        ) : null}
      </div>
    </div>
  )
}

export default RotaPlanningFeaturePreview
export { RotaPlanningFeaturePreview }
