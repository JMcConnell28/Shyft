import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon, CheckIcon } from "lucide-react"

import { BrandLockup } from "@/components/app/brand"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  badge: string
  eyebrow: string
  title: string
  description: string
  alternateLabel: string
  alternateHref: "/login" | "/sign-up"
  compactOnMobile?: boolean
  children: React.ReactNode
}

const highlights = [
  "Account-first onboarding with email verification and passkeys.",
  "Organization, location, and team setup designed for hospitality teams.",
  "A fast path from first login to your first rota.",
]

function AuthShell({
  badge,
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateHref,
  compactOnMobile = false,
  children,
}: AuthShellProps) {
  return (
    <div
      className={cn(
        "relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(255,255,255,1)_45%,_rgba(241,245,249,0.7)_100%)]",
        compactOnMobile && "max-lg:bg-background"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%)]",
          compactOnMobile && "max-lg:hidden"
        )}
      />
      <div
        className={cn(
          "relative mx-auto flex min-h-svh w-full max-w-7xl flex-col px-6 py-6 lg:px-8",
          compactOnMobile && "max-lg:px-5 max-lg:pt-4 max-lg:pb-8"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-between gap-4",
            compactOnMobile &&
              "max-lg:min-h-11 max-lg:border-b max-lg:border-border/60 max-lg:pb-3"
          )}
        >
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              compactOnMobile &&
                "max-lg:-ml-2 max-lg:h-10 max-lg:rounded-full max-lg:px-2.5 max-lg:text-sm"
            )}
          >
            <ArrowLeftIcon />
            Back to site
          </Link>
          <BrandLockup
            compact
            className={cn(
              compactOnMobile &&
                "max-lg:gap-2 max-lg:[&_div:first-child]:size-8 max-lg:[&_p]:text-sm"
            )}
          />
        </div>

        <div
          className={cn(
            "grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16",
            compactOnMobile && "max-lg:block max-lg:py-0"
          )}
        >
          <section
            className={cn("space-y-8", compactOnMobile && "max-lg:hidden")}
          >
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

            <Card className="max-w-xl border border-border/60 bg-background/70 shadow-xl shadow-slate-950/5 backdrop-blur">
              <CardContent className="space-y-4 pt-4">
                {highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <CheckIcon className="size-3" />
                    </div>
                    <p className="text-sm text-muted-foreground">{highlight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section
            className={cn(
              "mx-auto w-full max-w-md",
              compactOnMobile && "max-lg:pt-14"
            )}
          >
            {compactOnMobile ? (
              <div className="mb-8 space-y-2 lg:hidden">
                <p className="font-heading text-3xl font-semibold tracking-tight text-foreground">
                  {badge}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Sign in to continue to your RocketRota workspace.
                </p>
              </div>
            ) : null}
            {children}
            <p
              className={cn(
                "mt-5 text-center text-xs text-muted-foreground",
                compactOnMobile && "max-lg:hidden"
              )}
            >
              {alternateLabel}{" "}
              <Link
                to={alternateHref}
                search={{ redirect: "/dashboard" }}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Continue here
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

export { AuthShell }
