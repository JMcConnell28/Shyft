import { Link } from "@tanstack/react-router"
import { CheckIcon } from "lucide-react"

import { PreviewTrialLink } from "./landing-preview/preview-trial-link"
import { Badge } from "@/components/ui/badge"

function LandingHero() {
  return (
    <section
      aria-labelledby="landing-title"
      className="flex items-center pt-12"
    >
      <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
        <h1
          id="landing-title"
          className="mt-7 max-w-[760px] text-4xl leading-[1.04] font-extrabold tracking-[-0.04em] text-balance text-[#18316a] sm:mt-6 sm:text-5xl sm:leading-[0.98] sm:tracking-tight lg:text-[64px]"
        >
          Rota management
          <br />
          that <span className="text-[#2c69ff]">launches</span> productivity
        </h1>

        <p className="mt-7 max-w-[560px] text-[17px] leading-8 text-[#596f99] sm:mt-6 sm:text-lg">
          RocketRota makes scheduling simple, fair and efficient.
          <br />
          Save time, reduce admin and keep your team happy.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PreviewTrialLink />
          <Link
            to="/pricing"
            className="preview-button preview-button-secondary"
          >
            View pricing
          </Link>
        </div>

        <div className="mt-7 flex w-full flex-wrap justify-center gap-x-4 gap-y-2.5 text-sm font-medium text-[#5c729d] sm:mt-6 sm:w-auto sm:gap-x-6 sm:gap-y-3">
          {[
            "14-day free trial",
            "No credit card required",
            "Cancel anytime",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="inline-flex size-4 items-center justify-center rounded-full bg-[#e9f1ff] text-[#2c69ff]">
                <CheckIcon className="size-3" />
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { LandingHero }
