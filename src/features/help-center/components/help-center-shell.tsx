import type { ReactNode } from "react"
import { ArrowLeftIcon } from "lucide-react"

import { helpCategories } from "@/features/help-center/source"
import { cn } from "@/lib/utils"

type HelpCenterShellProps = {
  children: ReactNode
  currentSlug?: string
}

function HelpCenterShell({ children, currentSlug = "" }: HelpCenterShellProps) {
  return (
    <div className="min-h-svh bg-[#f7faff] text-[#12285c]">
      <div className="mx-auto grid min-h-svh w-full max-w-[1440px] lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-[#dfe8f8] bg-white/95 px-5 py-5 lg:sticky lg:top-0 lg:h-svh lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <a href="/help" className="flex items-center gap-3">
              <img
                src="/brand/rocketrota-logo.png"
                alt="RocketRota"
                className="h-8 w-auto object-contain"
              />
              <span className="font-extrabold tracking-tight text-[#16346e]">
                RocketRota Help
              </span>
            </a>

            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#65799f] transition-colors hover:text-[#16346e] lg:mt-9"
            >
              <ArrowLeftIcon className="size-4" />
              RocketRota
            </a>
          </div>

          <nav className="mt-7 hidden space-y-7 lg:block" aria-label="Help Centre">
            <a
              href="/help"
              className={cn(
                "block rounded-lg px-3 py-2 text-sm font-bold transition-colors",
                currentSlug === ""
                  ? "bg-[#edf4ff] text-[#2457d6]"
                  : "text-[#506994] hover:bg-[#f4f8ff] hover:text-[#16346e]",
              )}
            >
              Help Centre home
            </a>

            {helpCategories.map((category) => (
              <div key={category.id}>
                <p className="px-3 text-xs font-extrabold uppercase tracking-[0.16em] text-[#91a1be]">
                  {category.title}
                </p>
                <div className="mt-2 space-y-1">
                  {category.pages.map((page) => (
                    <a
                      key={page.slug}
                      href={`/help/${page.slug}`}
                      className={cn(
                        "block rounded-lg px-3 py-2 text-sm font-medium leading-5 transition-colors",
                        currentSlug === page.slug
                          ? "bg-[#edf4ff] text-[#2457d6]"
                          : "text-[#506994] hover:bg-[#f4f8ff] hover:text-[#16346e]",
                      )}
                    >
                      {page.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto w-full max-w-[980px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export { HelpCenterShell }
