import { Link } from "@tanstack/react-router"
import { ArrowRightLeftIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function ShiftSwapDisabledState({ dashboardHref }: { dashboardHref: string }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#f6f8fc] px-4 py-12 text-[#10204b]">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#236cff]">
          <ArrowRightLeftIcon className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Shift swapping is turned off
        </h1>
        <p className="mt-3 text-sm leading-6 font-medium text-[#68769a]">
          Your workspace has disabled shift swaps and cover requests. Ask a
          manager if you need to change a shift.
        </p>
        <Button
          className="mt-6 h-10 rounded-xl px-4 font-semibold"
          nativeButton={false}
          render={<Link to={dashboardHref} />}
        >
          Back to dashboard
        </Button>
      </div>
    </main>
  )
}

export { ShiftSwapDisabledState }
