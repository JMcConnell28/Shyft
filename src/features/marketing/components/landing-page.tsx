import { Link } from "@tanstack/react-router"
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
} from "lucide-react"

import { adminBenefits, customerLogos, featureHighlights } from "@/features/marketing/content"
import {
  marketingPrimaryHeroButtonClassName,
  marketingSecondaryButtonClassName,
} from "@/features/marketing/constants/button-styles"
import { MarketingFooter } from "@/features/marketing/components/marketing-footer"
import { MarketingHeader } from "@/features/marketing/components/marketing-header"
import { LandingRotaImage } from "@/features/marketing/components/landing-rota-image"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function LandingPage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <div className="bg-[#f8fbff] text-[#12285c]">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-top bg-no-repeat opacity-95"
          style={{ backgroundImage: "url('/brand/landing-background.png')" }}
        />
        <div className="absolute inset-x-0 top-0 h-80 bg-linear-to-b from-white/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-svh w-full max-w-[1280px] flex-col px-5 pb-16 pt-5 sm:px-6 lg:px-8">
          <MarketingHeader activePage="home" isAuthenticated={isAuthenticated} />
          <LandingHero />
          <LandingRotaImage />
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-4 pb-12 sm:px-6 lg:gap-10 lg:px-8">
        <FeatureSection />
        <ProductSection />
        <ProofSection />
        <FinalCtaSection />
      </main>

      <MarketingFooter />
    </div>
  )
}

function LandingHero() {
  return (
    <section className="flex items-center pt-12 sm:pt-12 lg:pt-12">
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-start text-left">
        <Badge
          variant="outline"
          className="rounded-full border-[#d7e5ff] bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#5874a7] shadow-sm"
        >
          <span className="mr-2 inline-flex size-2 rounded-full bg-[#2c69ff]" />
          The smarter way to manage your team
        </Badge>

        <h1 className="mt-7 max-w-[760px] text-balance text-4xl font-extrabold leading-[1.04] tracking-[-0.04em] text-[#18316a] sm:mt-6 sm:text-5xl sm:leading-[0.98] sm:tracking-tight lg:text-[64px]">
          Rota management
          <br />
          that <span className="text-[#2c69ff]">launches</span> productivity
        </h1>

        <p className="mt-7 max-w-[560px] text-[17px] leading-8 text-[#596f99] sm:mt-6 sm:text-lg">
          RocketRota makes scheduling simple, fair and efficient.
          <br />
          Save time, reduce admin and keep your team happy.
        </p>

        <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:mt-8 sm:flex sm:w-auto">
          <Link
            to="/sign-up"
            search={{ redirect: "/dashboard" }}
            className={cn(
              buttonVariants({ size: "lg" }),
              marketingPrimaryHeroButtonClassName,
              "!h-12 w-full justify-center gap-2 !rounded-xl !px-4 sm:!h-14 sm:w-auto sm:!rounded-2xl sm:!px-8",
            )}
          >
            Start free trial
            <ArrowRightIcon className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </Link>
          <Link
            to="/pricing"
            className={cn(
              buttonVariants({ variant: "pill", size: "lg" }),
              marketingSecondaryButtonClassName,
              "!h-12 w-full !rounded-xl !px-4 sm:!h-14 sm:w-auto sm:!rounded-2xl sm:!px-8",
            )}
          >
            View pricing
          </Link>
        </div>

        <div className="mt-7 flex w-full flex-wrap gap-x-4 gap-y-2.5 text-sm font-medium text-[#5c729d] sm:mt-6 sm:w-auto sm:gap-x-6 sm:gap-y-3">
          {["14-day free trial", "No credit card required", "Cancel anytime"].map(
            (item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#e9f1ff] text-[#2c69ff]">
                  <CheckIcon className="size-3" />
                </span>
                {item}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  return (
    <section className="grid gap-6 rounded-[30px] bg-white/70 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_1.9fr] lg:px-8">
      <div className="max-w-[320px] pt-2">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
          Built for modern teams
        </p>
        <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#18316a]">
          Everything you need
          <br />
          to run the perfect rota
        </h2>
        <p className="mt-5 text-base leading-8 text-[#5f7399]">
          Powerful features designed to save you time, reduce stress and keep your
          team on track.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {featureHighlights.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[24px] border border-[#dde8ff] bg-white px-5 py-6 shadow-[0_12px_34px_rgba(38,80,160,0.08)]"
          >
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2c69ff]">
              <feature.icon className="size-5" />
            </div>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight text-[#18316a]">
              {feature.title}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[#64789e]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ProductSection() {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#e0eaff] bg-white px-5 py-6 shadow-[0_20px_60px_rgba(38,80,160,0.08)] sm:px-7 lg:px-9 lg:py-8">
      <div className="grid items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-[360px]">
          <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
            Save time. Stay in control.
          </p>
          <h2 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight text-[#18316a]">
            Less admin,
            <br />
            more impact
          </h2>
          <p className="mt-5 text-base leading-8 text-[#60739a]">
            RocketRota automates the manual work so you can focus on what matters
            most, your team.
          </p>

          <div className="mt-6 space-y-3">
            {adminBenefits.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-[#4f638b]">
                <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-[#edf3ff] text-[#2c69ff]">
                  <CheckIcon className="size-3.5" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex justify-center">
          <div className="absolute right-10 top-7 h-36 w-36 rounded-full bg-[#eff5ff]" />
          <div className="absolute bottom-4 right-6 grid grid-cols-5 gap-2 opacity-55">
            {Array.from({ length: 35 }).map((_, index) => (
              <span key={index} className="size-1 rounded-full bg-[#b7c8ef]" />
            ))}
          </div>

          <div className="relative w-full max-w-[620px]">
            <div className="rounded-[28px] border border-[#dce7fb] bg-[#f5f8fd] p-4 shadow-[0_25px_60px_rgba(20,49,106,0.12)]">
              <div className="rounded-[22px] border border-[#e3ebfb] bg-white p-4">
                <div className="flex items-center justify-between border-b border-[#eef2fb] pb-3">
                  <div className="h-3.5 w-20 rounded-full bg-[#dbe4f4]" />
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#cdd8ec]" />
                    <span className="size-2 rounded-full bg-[#cdd8ec]" />
                    <span className="size-2 rounded-full bg-[#cdd8ec]" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-[100px_repeat(5,minmax(0,1fr))] gap-2">
                  {Array.from({ length: 24 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-12 rounded-xl",
                        index % 6 === 0
                          ? "bg-[#f3f6fb]"
                          : index % 5 === 0
                            ? "bg-[#edf1f8]"
                            : "bg-[#f7f9fd]",
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 right-3 w-[34%] rounded-[26px] border border-[#dce7fb] bg-white p-3 shadow-[0_20px_50px_rgba(20,49,106,0.12)]">
              <div className="rounded-[22px] bg-[#f6f9fd] p-3">
                <div className="mx-auto h-1 w-14 rounded-full bg-[#d5def0]" />
                <div className="mt-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="rounded-xl bg-white p-3">
                      <div className="h-2.5 w-16 rounded-full bg-[#d5def0]" />
                      <div className="mt-2 h-2 w-10 rounded-full bg-[#e7edf7]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProofSection() {
  return (
    <section className="grid gap-8 px-2 py-4 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="max-w-[380px]">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
          Trusted by teams like yours
        </p>
        <h2 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight text-[#18316a]">
          Loved by managers
          <br />
          and teams
        </h2>

        <div className="mt-5 flex items-center gap-1 text-[#2c69ff]">
          {Array.from({ length: 5 }).map((_, index) => (
            <ChevronRightIcon
              key={index}
              className="size-4 fill-current stroke-[3]"
            />
          ))}
        </div>

        <p className="mt-5 text-base leading-8 text-[#60739a]">
          "RocketRota has completely transformed the way we schedule. It&apos;s
          saved us hours every week and the team love how easy it is to use."
        </p>

        <div className="mt-7 flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#dbe7ff] text-sm font-extrabold text-[#18316a]">
            SW
          </div>
          <div>
            <p className="text-sm font-extrabold text-[#18316a]">Sophie Williams</p>
            <p className="text-sm text-[#667ba1]">Operations Manager, Apexive</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-10 pt-6 text-[30px] font-extrabold tracking-tight text-[#a5b2cb] sm:grid-cols-3">
        {customerLogos.map((logo) => (
          <div key={logo} className="flex min-h-14 items-center">
            {logo}
          </div>
        ))}
      </div>
    </section>
  )
}

function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-[#dce7fb] bg-[#f6f9ff] px-6 py-8 shadow-[0_18px_50px_rgba(38,80,160,0.08)] sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[300px]">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-[#18316a]">
            Ready to launch
            <br />
            your productivity?
          </h2>
          <p className="mt-4 text-base leading-7 text-[#60739a]">
            Join thousands of teams already scheduling smarter with RocketRota.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/sign-up"
            search={{ redirect: "/dashboard" }}
            className={cn(
              buttonVariants({ size: "lg" }),
              marketingPrimaryHeroButtonClassName,
            )}
          >
            Start free trial
            <ArrowRightIcon className="size-4 transition-transform group-hover/button:translate-x-0.5" />
          </Link>
          <Link
            to="/pricing"
            className={cn(
              buttonVariants({ variant: "pill", size: "lg" }),
              marketingSecondaryButtonClassName,
            )}
          >
            View pricing
          </Link>
        </div>
      </div>
    </section>
  )
}

export { LandingPage }
