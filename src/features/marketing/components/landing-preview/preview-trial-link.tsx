import { Link } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function PreviewTrialLink({ className }: { className?: string }) {
  return (
    <Link
      to="/sign-up"
      search={{ redirect: "/dashboard" }}
      className={cn("preview-button preview-button-primary", className)}
    >
      Start free trial
      <ArrowRightIcon size={16} aria-hidden="true" />
    </Link>
  )
}
