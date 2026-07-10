import {
  ArrowRightIcon,
  Clock3Icon,
  LightbulbIcon,
  UserRoundIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react"

import {
  helpCategories,
  popularHelpPages,
} from "@/features/help-center/source"
import type { HelpCategoryId } from "@/features/help-center/types"

const categoryIcons = {
  managers: UsersRoundIcon,
  employees: UserRoundIcon,
  "rota-tips": LightbulbIcon,
} satisfies Record<HelpCategoryId, LucideIcon>

function HelpCenterHome() {
  return (
    <div>
      <header className="border-b border-[#dfe8f8] pb-10">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
          RocketRota Help Centre
        </p>
        <h1 className="mt-4 max-w-[780px] text-4xl font-extrabold leading-tight tracking-tight text-[#16346e] sm:text-5xl">
          Practical guides for managers and teams
        </h1>
        <p className="mt-5 max-w-[680px] text-base leading-8 text-[#65799f]">
          Learn the essential RocketRota workflows, from setting up your
          workplace to publishing rotas, checking shifts and recording time.
        </p>
      </header>

      <section className="py-9">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#16346e]">
              Start with what you need to do
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#65799f]">
              Choose the path that matches your role or the problem you are
              trying to solve.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {helpCategories.map((category) => {
            const Icon = categoryIcons[category.id]

            return (
              <section
                key={category.id}
                className="rounded-xl border border-[#dfe8f8] bg-white p-5 shadow-[0_16px_40px_rgba(38,80,160,0.06)]"
              >
                <div className="inline-flex size-11 items-center justify-center rounded-xl bg-[#edf4ff] text-[#2c69ff]">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#16346e]">
                  {category.title}
                </h3>
                <p className="mt-2 min-h-14 text-sm leading-6 text-[#65799f]">
                  {category.description}
                </p>

                <div className="mt-4 space-y-1">
                  {category.pages.slice(0, 3).map((page) => (
                    <a
                      key={page.slug}
                      href={`/help/${page.slug}`}
                      className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm font-semibold text-[#40577f] transition-colors hover:bg-[#f4f8ff] hover:text-[#2457d6]"
                    >
                      <span>{page.title}</span>
                      <ArrowRightIcon className="size-4 shrink-0 opacity-45 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </a>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </section>

      <section className="border-t border-[#dfe8f8] py-9">
        <h2 className="text-2xl font-extrabold tracking-tight text-[#16346e]">
          Essential guides
        </h2>
        <p className="mt-2 max-w-[620px] text-sm leading-6 text-[#65799f]">
          The first guides most workplaces need when getting value from
          RocketRota.
        </p>

        <div className="mt-6 grid gap-3">
          {popularHelpPages.map((page) => (
            <a
              key={page.slug}
              href={`/help/${page.slug}`}
              className="group grid gap-3 rounded-xl border border-[#dfe8f8] bg-white p-4 shadow-[0_10px_28px_rgba(38,80,160,0.05)] transition hover:border-[#bed1fb] hover:shadow-[0_16px_36px_rgba(38,80,160,0.08)] sm:grid-cols-[1fr_auto]"
            >
              <span>
                <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#2c69ff]">
                  {page.audience}
                </span>
                <span className="mt-2 block text-base font-extrabold text-[#16346e]">
                  {page.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-[#65799f]">
                  {page.description}
                </span>
              </span>
              <span className="flex items-center gap-2 text-sm font-semibold text-[#65799f] sm:justify-end">
                <Clock3Icon className="size-4" />
                {page.readingTime}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

export { HelpCenterHome }
