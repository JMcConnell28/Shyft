import { Link } from "@tanstack/react-router"
import { ArrowRightIcon, Building2Icon, MapPinIcon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"

const setupOptions = [
  {
    title: "One workplace",
    description: "Start with one rota for one venue, shop, site or team base.",
    example: "Example: The Crown, Main Street Shop, City Clinic.",
    to: "/onboarding/location",
    icon: MapPinIcon,
  },
  {
    title: "Organisation",
    description:
      "Create a parent organisation before adding the first workplace.",
    example: "Example: a group with several branches or contracts.",
    to: "/onboarding/org",
    icon: Building2Icon,
  },
] as const

function SetupChoicePage() {
  return (
    <OnboardingShell
      badge="Setup"
      eyebrow="Step 2"
      title="Are you setting up one workplace or an organisation?"
      description="Choose the structure first. The next step will ask how locations work for your team."
      progress={30}
      showBackToDashboard={false}
      showSignOut
    >
      <div className="space-y-3 rounded-xl border border-border/70 bg-background p-3 shadow-sm sm:p-4">
        {setupOptions.map((option) => (
          <Link
            key={option.title}
            to={option.to}
            className="group block rounded-lg border border-border/70 bg-background p-3 transition-[border-color,background-color,transform,box-shadow] duration-150 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none motion-reduce:transition-none"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg border border-border/70 bg-muted/30 p-2 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                <option.icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {option.title}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                      {option.description}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {option.example}
                    </p>
                  </div>
                  <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        <p className="text-center text-xs text-muted-foreground">
          Joining an existing team?{" "}
          <Link
            to="/onboarding/join"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Use an invite
          </Link>
        </p>
      </div>
    </OnboardingShell>
  )
}

export { SetupChoicePage }
