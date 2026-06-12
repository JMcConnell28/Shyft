"use client"

import * as React from "react"

import RotaWorkspace from "@/features/rota/components/rota-workspace"
import { demoRotaBoardData } from "@/features/rota-demo/data/demo-rota-board"

function LandingRotaDemo() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section data-testid="landing-rota-demo" className="mt-8 lg:mt-10">
      <div className="overflow-hidden rounded-[30px] border border-[#dde8ff] bg-background shadow-[0_30px_80px_rgba(45,87,171,0.12)]">
        <div className="h-[580px] min-h-0 sm:h-[620px]">
          {mounted ? (
            <RotaWorkspace boardData={demoRotaBoardData} mode="demo" />
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { LandingRotaDemo }
