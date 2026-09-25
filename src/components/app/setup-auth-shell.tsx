import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import type { ReactNode } from "react"

import { BrandedArtworkShell } from "@/components/app/branded-artwork-shell"

type SetupAuthShellProps = {
  title: string
  description: string
  alternateLabel: string
  alternateAction: string
  alternateHref: "/login" | "/sign-up"
  alternateRedirect: string
  showArtwork?: boolean
  hideAlternate?: boolean
  children: ReactNode
}

const setupAuthPrimaryButtonClassName =
  "h-11 w-full rounded-xl bg-[#1264e9] text-sm font-semibold shadow-[0_10px_24px_rgba(18,100,233,0.16)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#0757d7] hover:shadow-[0_14px_28px_rgba(18,100,233,0.2)] motion-reduce:transform-none"

const setupAuthSecondaryButtonClassName =
  "h-11 w-full rounded-xl border-[#cbd9f1] text-sm font-semibold text-[#24395f] shadow-none hover:bg-[#f2f7ff]"

function SetupAuthShell({
  title,
  description,
  alternateLabel,
  alternateAction,
  alternateHref,
  alternateRedirect,
  showArtwork = true,
  hideAlternate = false,
  children,
}: SetupAuthShellProps) {
  return (
    <BrandedArtworkShell
      showArtwork={showArtwork}
      headerAction={
        <Link
          to="/"
          data-pwa-hide
          aria-label="Back to site"
          className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#53698d] hover:text-[#075fe6]"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span className="hidden sm:inline">Back to site</span>
        </Link>
      }
    >
      <div className="mx-auto max-w-[540px] [&_[data-slot=field-label]]:text-sm [&_[data-slot=field-label]]:font-semibold [&_[data-slot=field-label]]:text-[#24395f] [&_[data-slot=field]]:gap-1 [&_[data-slot=input]]:h-11 [&_[data-slot=input]]:rounded-xl [&_[data-slot=input]]:border-[#cbd9f1] [&_[data-slot=input]]:text-sm [&_[data-slot=input]]:shadow-none [&_[data-slot=input]]:focus-visible:border-[#1264e9]">
        <div className="mb-5 text-center">
          <h1 className="font-heading text-2xl font-extrabold tracking-[-0.05em] text-[#111f45] sm:text-[1.85rem]">
            {title}
          </h1>
          <p className="mt-1 text-xs leading-5 text-[#56698d] sm:text-sm">
            {description}
          </p>
        </div>
        {children}
        {!hideAlternate ? (
          <p className="mt-4 text-center text-xs text-[#657797]">
            {alternateLabel}{" "}
            <Link
              to={alternateHref}
              search={{ redirect: alternateRedirect }}
              className="font-semibold text-[#075fe6] underline underline-offset-4 hover:text-[#064cb8]"
            >
              {alternateAction}
            </Link>
          </p>
        ) : null}
      </div>
    </BrandedArtworkShell>
  )
}

export {
  SetupAuthShell,
  setupAuthPrimaryButtonClassName,
  setupAuthSecondaryButtonClassName,
}
