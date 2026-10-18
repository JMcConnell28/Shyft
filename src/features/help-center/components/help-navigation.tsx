import { helpCategories } from "@/features/help-center/source"
import { cn } from "@/lib/utils"

function HelpNavigation({ currentSlug }: { currentSlug: string }) {
  return (
    <nav className="space-y-6" aria-label="Help Centre">
      <a
        href="/help"
        aria-current={currentSlug === "" ? "page" : undefined}
        className={cn(
          "block rounded-lg px-3 py-2 text-sm font-bold hover:bg-[#f4f8ff]",
          currentSlug === "" ? "bg-[#edf4ff] text-[#2457d6]" : "text-[#506994]"
        )}
      >
        Help Centre home
      </a>
      {helpCategories.map((category) => (
        <div key={category.id}>
          <p className="px-3 text-xs font-extrabold tracking-wider text-[#65799f] uppercase">
            {category.title}
          </p>
          <div className="mt-2 space-y-1">
            {category.pages.map((page) => (
              <a
                key={page.slug}
                href={`/help/${page.slug}`}
                aria-current={currentSlug === page.slug ? "page" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm leading-5 font-medium hover:bg-[#f4f8ff] focus-visible:outline-2 focus-visible:outline-[#2457d6]",
                  currentSlug === page.slug
                    ? "bg-[#edf4ff] text-[#2457d6]"
                    : "text-[#506994] hover:text-[#16346e]"
                )}
              >
                {page.title}
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}

export { HelpNavigation }
