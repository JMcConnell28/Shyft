import { landingWorkflowSteps } from "@/features/marketing/constants/landing-workflow"

function LandingWorkflowSection() {
  return (
    <section className="grid gap-8 px-2 py-4 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="max-w-[380px]">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-[#2c69ff]">
          From planning to payroll prep
        </p>
        <h2 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight text-[#18316a]">
          One place for
          <br />
          the working week
        </h2>
        <p className="mt-5 text-base leading-8 text-[#60739a]">
          Connect your rota, staff clock-ins and timesheets. Keep the plan and
          recorded hours together, from the first shift to the end of the week.
        </p>
      </div>

      <ol className="divide-y divide-[#e0eaff]">
        {landingWorkflowSteps.map((step, index) => (
          <li key={step.title} className="flex gap-5 py-6 first:pt-2 last:pb-0">
            <span
              aria-hidden="true"
              className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-sm font-extrabold text-[#2c69ff]"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#18316a]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#64789e]">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { LandingWorkflowSection }
