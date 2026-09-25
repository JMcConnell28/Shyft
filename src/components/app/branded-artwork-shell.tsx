import type { ReactNode } from "react"

import { BrandMark } from "@/components/app/brand"

function BrandedArtworkShell({
  children,
  headerAction,
  showArtwork = true,
}: {
  children: ReactNode
  headerAction: ReactNode
  showArtwork?: boolean
}) {
  return (
    <main className="relative isolate h-svh overflow-hidden bg-[#f7fbff] px-3 py-3 text-[#111f45] sm:px-5 sm:py-4">
      {showArtwork ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10 bg-[url('/brand/onboarding-mobile.png')] bg-[length:100%_100%] bg-center bg-no-repeat lg:bg-[url('/brand/onboarding-desktop.png')] lg:bg-cover"
        />
      ) : null}
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[700px] flex-col items-center">
        <header className="relative mb-3 flex w-full shrink-0 items-center justify-center">
          <div className="flex items-center gap-2" aria-label="RocketRota">
            <BrandMark className="size-9 rounded-none bg-transparent p-0 sm:size-10" />
            <span className="font-heading text-[1.45rem] font-extrabold tracking-[-0.06em] text-[#11224e] sm:text-[1.7rem]">
              Rocket<span className="text-[#1264e9]">Rota</span>
            </span>
          </div>
          <div className="absolute right-0">{headerAction}</div>
        </header>
        <div className="flex min-h-0 w-full flex-1 items-center">
          <div className="max-h-full w-full overflow-y-auto overscroll-contain rounded-[22px] border border-[#e3ecfc] bg-white p-4 shadow-[0_22px_70px_rgba(37,100,188,0.09)] sm:p-5">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}

export { BrandedArtworkShell }
