import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon, CheckCircle2Icon } from "lucide-react"

import { BrandLockup } from "@/components/app/brand"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type OnboardingShellProps = {
  badge: string
  eyebrow: string
  title: string
  description: string
  progress?: number
  children: React.ReactNode
  showBackToDashboard?: boolean
}

const setupHighlights = [
  "Account-first onboarding that keeps the first setup short.",
  "One clean path from organization creation to the first rota.",
  "Mobile-friendly screens that still feel deliberate on desktop.",
]

function OnboardingShell({
  badge,
  eyebrow,
  title,
  description,
  progress,
  children,
  showBackToDashboard = true,
}: OnboardingShellProps) {
  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_40%,_rgba(241,245,249,0.86)_100%)]">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%)]" />
      <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={showBackToDashboard ? "/dashboard" : "/"}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ArrowLeftIcon />
            {showBackToDashboard ? "Back to workspace" : "Back to site"}
          </Link>
          <BrandLockup compact />
        </div>

        <div className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
          <section className="space-y-8">
            <div className="space-y-4">
              <Badge variant="outline">{badge}</Badge>
              <div className="space-y-3">
                <p className="text-sm font-medium text-primary">{eyebrow}</p>
                <h1 className="max-w-xl font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="max-w-xl space-y-4 rounded-3xl border border-border/60 bg-background/70 p-5 shadow-xl shadow-slate-950/5 backdrop-blur">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Setup progress
                </p>
                <Progress value={progress ?? 0} className="h-2.5" />
              </div>
              <div className="space-y-3">
                {setupHighlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-600">
                      <CheckCircle2Icon className="size-3.5" />
                    </div>
                    <p className="text-sm text-muted-foreground">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-lg">{children}</section>
        </div>
      </div>
    </div>
  )
}

export { OnboardingShell }
