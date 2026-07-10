import * as React from "react"
import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { BrandLockup } from "@/components/app/brand"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

type OnboardingShellProps = {
  badge: string
  eyebrow: string
  title: string
  description: string
  progress?: number
  children: React.ReactNode
  contentWidth?: "default" | "wide"
  showBackToDashboard?: boolean
  showSignOut?: boolean
}

function OnboardingShell({
  badge,
  eyebrow,
  title,
  description,
  progress,
  children,
  contentWidth = "default",
  showBackToDashboard = true,
  showSignOut = false,
}: OnboardingShellProps) {
  const [isSigningOut, setIsSigningOut] = React.useState(false)

  async function handleSignOut() {
    setIsSigningOut(true)

    const result = await authClient.signOut()

    if (result.error) {
      setIsSigningOut(false)
      return
    }

    window.location.href = "/login"
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-3 py-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={showBackToDashboard ? "/dashboard" : "/"}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ArrowLeftIcon />
            {showBackToDashboard ? "Back to workspace" : "Back to site"}
          </Link>
          <div className="flex items-center gap-2">
            <BrandLockup compact />
            {showSignOut ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void handleSignOut()}
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Log out"}
              </Button>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "mx-auto flex min-h-0 w-full flex-1 flex-col justify-center gap-3 py-5 sm:gap-4 sm:py-7",
            contentWidth === "wide" ? "max-w-5xl" : "max-w-2xl"
          )}
        >
          <section className="space-y-3">
            <div className="space-y-2">
              <Badge variant="outline" className="text-[11px]">
                {badge}
              </Badge>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-primary sm:text-sm">
                  {eyebrow}
                </p>
                <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h1>
                <p className="text-sm leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
            {typeof progress === "number" ? (
              <div className="h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300 motion-reduce:transition-none"
                  style={{ width: `${progress}%` }}
                />
              </div>
            ) : null}
          </section>

          <section className="min-h-0 w-full">{children}</section>
        </div>
      </div>
    </div>
  )
}

export { OnboardingShell }
