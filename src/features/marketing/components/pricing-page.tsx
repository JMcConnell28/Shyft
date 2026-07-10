import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { MarketingFooter } from "@/features/marketing/components/marketing-footer"
import { MarketingHeader } from "@/features/marketing/components/marketing-header"
import { PricingCalculator } from "@/features/marketing/components/pricing-calculator"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CORE_BASE_PRICE_GBP,
  EXTRA_EMPLOYEE_PRICE_GBP,
  INCLUDED_CORE_EMPLOYEES,
  TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP,
  formatGbp,
} from "@/features/marketing/utils/pricing"

function PricingPage() {
  return (
    <div className="bg-[#f8fbff] text-[#12285c]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-top bg-no-repeat opacity-95"
          style={{ backgroundImage: "url('/brand/landing-background.png')" }}
        />
        <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-white/70 via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-[1280px] px-4 pt-5 pb-14 sm:px-6 lg:px-8">
          <MarketingHeader activePage="pricing" />

          <div className="grid gap-10 pt-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:pt-16">
            <div className="max-w-[620px]">
              <Badge
                variant="outline"
                className="rounded-full border-[#d7e5ff] bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#5874a7] shadow-sm"
              >
                Straightforward pricing for growing teams
              </Badge>

              <h1 className="mt-6 text-5xl leading-[0.98] font-extrabold tracking-tight text-balance text-[#18316a] sm:text-6xl lg:text-[72px]">
                Simple pricing
                <br />
                that scales with you
              </h1>

              <p className="mt-6 max-w-[540px] text-lg leading-8 text-[#596f99]">
                Pay {formatGbp(CORE_BASE_PRICE_GBP)} per month including your
                first {INCLUDED_CORE_EMPLOYEES} used employees, then{" "}
                {formatGbp(EXTRA_EMPLOYEE_PRICE_GBP)} per extra employee.
                Unlimited locations are included. Prices exclude VAT.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/sign-up"
                  search={{ redirect: "/dashboard" }}
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-14 rounded-2xl bg-[#2c69ff] px-7 text-sm font-semibold shadow-[0_16px_40px_rgba(44,105,255,0.26)] hover:bg-[#2259e3]"
                  )}
                >
                  Start free trial
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  to="/login"
                  search={{ redirect: "/dashboard" }}
                  className={cn(
                    buttonVariants({ variant: "pill", size: "lg" }),
                    "h-14 rounded-2xl border-[#d9e4fb] bg-white px-7 text-sm font-semibold text-[#18316a] shadow-[0_10px_30px_rgba(18,40,92,0.06)]"
                  )}
                >
                  Log in
                </Link>
              </div>

              <div className="mt-8 space-y-3">
                {[
                  "One clear monthly price with no hidden tiers.",
                  "Perfect for single venues and multi-location groups.",
                  "Built to stay affordable as your team grows.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-[#5c729d]"
                  >
                    <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#e9f1ff] text-[#2c69ff]">
                      <CheckIcon className="size-3.5" />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <PricingCalculator />
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-12 sm:px-6 lg:gap-10 lg:px-8">
        <PricingExplainer />
        <PricingFaq />
      </main>

      <MarketingFooter />
    </div>
  )
}

function PricingExplainer() {
  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <PricingCard
        eyebrow="Step 1"
        title={`${formatGbp(CORE_BASE_PRICE_GBP)} base plan`}
        body="Your organisation includes unlimited locations and the first 10 employees used in a billing period."
      />
      <PricingCard
        eyebrow="Step 2"
        title={`${INCLUDED_CORE_EMPLOYEES} employees included`}
        body="Dormant staff do not count until they appear on a published rota or timesheet activity."
      />
      <PricingCard
        eyebrow="Step 3"
        title={`${formatGbp(EXTRA_EMPLOYEE_PRICE_GBP)} per extra employee`}
        body="The core plan scales with distinct used employees across the organisation, not by location."
      />
      <PricingCard
        eyebrow="Optional"
        title={`${formatGbp(TIME_ATTENDANCE_EMPLOYEE_PRICE_GBP)} Time & Attendance`}
        body="Enable clocking per location and pay per used employee in enabled locations. One NFC stand is included per location."
      />
    </section>
  )
}

function PricingCard({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-[28px] border border-[#dde8ff] bg-white px-6 py-6 shadow-[0_16px_40px_rgba(38,80,160,0.08)]">
      <p className="text-sm font-extrabold tracking-[0.18em] text-[#2c69ff] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#18316a]">
        {title}
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#64789e]">{body}</p>
    </div>
  )
}

function PricingFaq() {
  return (
    <section className="rounded-[30px] border border-[#e0eaff] bg-white px-6 py-7 shadow-[0_20px_60px_rgba(38,80,160,0.08)] sm:px-8">
      <div className="max-w-[620px]">
        <p className="text-sm font-extrabold tracking-[0.18em] text-[#2c69ff] uppercase">
          Good to know
        </p>
        <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#18316a]">
          A pricing model your team can actually understand
        </h2>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <FaqItem
          question="How are employees counted?"
          answer="We count distinct employees used in the billing period through published rotas or timesheet activity. Unused staff are excluded."
        />
        <FaqItem
          question="What if I only have one small venue?"
          answer="That is exactly what the base plan is for. Teams with up to 10 used employees stay at £25 per month, excluding VAT."
        />
        <FaqItem
          question="Can I grow without changing plan?"
          answer="Yes. Add as many locations and zones as you need. Billing stays based on used employees."
        />
      </div>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-[24px] bg-[#f8fbff] px-5 py-5">
      <h3 className="text-lg font-extrabold tracking-tight text-[#18316a]">
        {question}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[#64789e]">{answer}</p>
    </div>
  )
}

export { PricingPage }
