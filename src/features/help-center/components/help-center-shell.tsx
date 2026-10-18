import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react"

import { HelpNavigation } from "./help-navigation"
import type { ReactNode } from "react"

type HelpCenterShellProps = {
  children: ReactNode
  currentSlug?: string
}

function HelpCenterShell({ children, currentSlug = "" }: HelpCenterShellProps) {
  return (
    <div className="min-h-svh bg-[#f7faff] text-[#12285c]">
      <a
        href="#help-content"
        className="sr-only rounded bg-white p-3 text-[#2457d6] focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
      >
        Skip to content
      </a>
      <div className="mx-auto grid min-h-svh w-full max-w-[1440px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-b border-[#dfe8f8] bg-white px-5 py-5 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-r lg:border-b-0 lg:px-5">
          <div className="flex items-center justify-between gap-3 lg:block">
            <a href="/help" className="flex min-w-0 items-center gap-2.5">
              <img
                src="/brand/rocketrota-logo.png"
                alt=""
                className="h-7 w-auto object-contain"
              />
              <span className="text-sm font-extrabold tracking-tight text-[#16346e]">
                RocketRota Help
              </span>
            </a>
            <a
              href="/"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#65799f] hover:text-[#16346e] lg:mt-6"
            >
              <ArrowLeftIcon aria-hidden="true" className="size-4" />
              RocketRota
            </a>
          </div>
          <div className="mt-7 hidden min-h-0 flex-1 overflow-y-auto pb-4 lg:block">
            <HelpNavigation currentSlug={currentSlug} />
          </div>
          <details key={currentSlug} className="group mt-4 lg:hidden">
            <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between rounded-lg border border-[#dfe8f8] px-3 text-sm font-semibold text-[#40577f] [&::-webkit-details-marker]:hidden">
              Browse help guides
              <ChevronDownIcon
                aria-hidden="true"
                className="size-4 group-open:rotate-180"
              />
            </summary>
            <div className="mt-4 max-h-[60svh] overflow-y-auto pb-3">
              <HelpNavigation currentSlug={currentSlug} />
            </div>
          </details>
        </aside>
        <main
          id="help-content"
          tabIndex={-1}
          className="min-w-0 px-5 py-8 outline-none sm:px-8 lg:px-12 lg:py-12"
        >
          <div className="mx-auto w-full max-w-[900px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export { HelpCenterShell }
