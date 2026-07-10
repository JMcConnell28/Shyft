import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import {
  featurePageTrustItems,
  marketingFeaturePages,
  type MarketingFeatureSlug,
} from "@/features/marketing/content"
import { MarketingFooter } from "@/features/marketing/components/marketing-footer"
import { MarketingHeader } from "@/features/marketing/components/marketing-header"
import { FeatureVisual } from "@/features/marketing/components/feature-visual"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FeaturePageProps = {
  feature: MarketingFeatureSlug
}

function FeaturePage({ feature }: FeaturePageProps) {
  const content = marketingFeaturePages[feature]

  return (
    <div className="bg-[#f8fbff] text-[#12285c]">
      <section className="relative overflow-hidden border-b border-[#e3edff] bg-[#f8fbff]">
        <div className="absolute inset-x-0 top-0 h-56 bg-white" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[#eef5ff]" />
        <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-14 pt-5 sm:px-6 lg:px-8">
          <MarketingHeader activePage="features" />

          <div className="grid gap-10 pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pt-14">
            <div className="max-w-[640px]">
              <Badge
                variant="outline"
                className="rounded-full border-[#d7e5ff] bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#5874a7] shadow-sm"
              >
                {content.eyebrow}
              </Badge>

              <h1 className="mt-6 text-balance text-5xl font-extrabold leading-[0.98] tracking-tight text-[#18316a] sm:text-6xl lg:text-[70px]">
                {content.title}
              </h1>

              <p className="mt-6 max-w-[560px] text-lg leading-8 text-[#596f99]">
                {content.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/sign-up"
                  search={{ redirect: "/dashboard" }}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-14 rounded-2xl bg-[#2c69ff] px-7 text-sm font-semibold shadow-[0_16px_40px_rgba(44,105,255,0.26)] hover:bg-[#2259e3]",
                  )}
                >
                  Start free trial
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  to="/pricing"
                  className={cn(
                    buttonVariants({ variant: "pill", size: "lg" }),
                    "h-14 rounded-2xl border-[#d9e4fb] bg-white px-7 text-sm font-semibold text-[#18316a] shadow-[0_10px_30px_rgba(18,40,92,0.06)]",
                  )}
                >
                  View pricing
                </Link>
              </div>

              <div className="mt-8 space-y-3">
                {content.heroPoints.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-[#5c729d]">
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#e9f1ff] text-[#2c69ff]">
                      <CheckIcon className="size-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <FeatureVisual feature={feature} />
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-12 sm:px-6 lg:gap-10 lg:px-8">
        <FeatureWorkflow feature={feature} />
        <FeatureTrust />
        <FeatureCta title={content.navTitle} />
      </main>

      <MarketingFooter />
    </div>
  )
}

function FeatureWorkflow({ feature }: { feature: MarketingFeatureSlug }) {
  const content = marketingFeaturePages[feature]

  return (
    <section className="rounded-[30px] border border-[#e0eaff] bg-white px-6 py-7 shadow-[0_20px_60px_rgba(38,80,160,0.08)] sm:px-8">
      <div className="max-w-[680px]">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
          Workflow
        </p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#18316a]">
          {content.workflowTitle}
        </h2>
        <p className="mt-4 text-base leading-8 text-[#60739a]">
          {content.workflowDescription}
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {content.workflowItems.map((item) => (
          <div key={item.title} className="rounded-[24px] bg-[#f8fbff] px-5 py-5">
            <h3 className="text-xl font-extrabold tracking-tight text-[#18316a]">
              {item.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#64789e]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {content.proofItems.map((item) => (
          <span
            key={item}
            className="rounded-full border border-[#dce7fb] bg-white px-3 py-1.5 text-xs font-semibold text-[#506994]"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  )
}

function FeatureTrust() {
  return (
    <section className="grid gap-4 lg:grid-cols-3">
      {featurePageTrustItems.map((item) => (
        <div
          key={item.title}
          className="rounded-[28px] border border-[#dde8ff] bg-white px-6 py-6 shadow-[0_16px_40px_rgba(38,80,160,0.08)]"
        >
          <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2c69ff]">
            <item.icon className="size-5" />
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-[#18316a]">
            {item.title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#64789e]">
            {item.description}
          </p>
        </div>
      ))}
    </section>
  )
}

function FeatureCta({ title }: { title: string }) {
  return (
    <section className="rounded-[30px] border border-[#dce7fb] bg-[#f6f9ff] px-6 py-8 shadow-[0_18px_50px_rgba(38,80,160,0.08)] sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[460px]">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-[#18316a]">
            Ready to try {title.toLowerCase()}?
          </h2>
          <p className="mt-4 text-base leading-7 text-[#60739a]">
            Start with the full RocketRota workspace and see how the pieces fit together.
          </p>
        </div>

        <Link
          to="/sign-up"
          search={{ redirect: "/dashboard" }}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-14 rounded-2xl bg-[#2c69ff] px-8 text-sm font-semibold shadow-[0_16px_40px_rgba(44,105,255,0.22)] hover:bg-[#2259e3]",
          )}
        >
          Start free trial
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>
    </section>
  )
}

export { FeaturePage }
