import { Link } from "@tanstack/react-router"
import { ShieldXIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function AccessDeniedState({
  dashboardHref,
  description = "Your role does not include access to this area.",
  title = "You do not have permission to view this page",
}: {
  dashboardHref: string
  description?: string
  title?: string
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldXIcon className="size-6" />
        </div>
        <p className="mt-5 text-sm font-medium text-muted-foreground">
          Access denied
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
        <Button
          className="mt-6"
          nativeButton={false}
          render={<Link to={dashboardHref} />}
        >
          Back to dashboard
        </Button>
      </div>
    </div>
  )
}

export { AccessDeniedState }
