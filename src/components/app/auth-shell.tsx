import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"

import { BrandLockup } from "@/components/app/brand"
import { SignOutButton } from "@/components/app/sign-out-button"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthShellProps = {
  eyebrow: string
  title: string
  description: string
  alternateLabel: string
  alternateAction: string
  alternateHref: "/login" | "/sign-up"
  alternateRedirect?: string
  contentWidth?: "default" | "wide"
  hideAlternate?: boolean
  showSignOut?: boolean
  children: React.ReactNode
}

function AuthShell({
  eyebrow,
  title,
  description,
  alternateLabel,
  alternateAction,
  alternateHref,
  alternateRedirect = "/dashboard",
  contentWidth = "default",
  hideAlternate = false,
  showSignOut = false,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-[#f6f8fc] text-[#10204b]">
      <header className="border-b border-[#e3e8f2] bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="RocketRota home">
            <BrandLockup compact />
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/"
              data-pwa-hide
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "text-[#53617f] hover:bg-[#f5f7fb] hover:text-[#10204b]"
              )}
            >
              <ArrowLeftIcon />
              Back to site
            </Link>
            {showSignOut ? (
              <SignOutButton className="text-[#53617f] hover:bg-[#f5f7fb] hover:text-[#10204b]" />
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div
          className={cn(
            "mx-auto w-full",
            contentWidth === "wide" ? "max-w-xl" : "max-w-md"
          )}
        >
          <header className="mb-5">
            <p className="text-xs font-bold text-blue-600">{eyebrow}</p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.035em] text-[#10204b] sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-6 font-medium text-[#657398]">
              {description}
            </p>
          </header>

          {children}

          {!hideAlternate ? (
            <p className="mt-5 text-center text-xs font-medium text-[#7180a2]">
              {alternateLabel}{" "}
              <Link
                to={alternateHref}
                search={{ redirect: alternateRedirect }}
                className="font-bold text-blue-600 underline-offset-4 hover:underline"
              >
                {alternateAction}
              </Link>
            </p>
          ) : null}
        </div>
      </main>
    </div>
  )
}

export { AuthShell }
