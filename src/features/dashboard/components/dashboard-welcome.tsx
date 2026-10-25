import * as React from "react"
import { useQuery } from "@tanstack/react-query"
import { dashboardWelcomeQueryOptions } from "../query-options"
import type { DashboardWelcomeModal } from "./dashboard-welcome-modal"

const WelcomeModal = React.lazy(() =>
  import("./dashboard-welcome-modal").then((module) => ({
    default: module.DashboardWelcomeModal,
  }))
)

type DashboardWelcomeProps = Omit<
  React.ComponentProps<typeof DashboardWelcomeModal>,
  "initiallyOpen"
>

// Optional onboarding never blocks staffing/clock content or route resolution.
function DashboardWelcome(props: DashboardWelcomeProps) {
  const query = useQuery(
    dashboardWelcomeQueryOptions(props.workspace, props.userId)
  )
  if (query.isError) {
    return (
      <p role="status" className="px-4 py-2 text-sm text-muted-foreground">
        Getting-started tips are unavailable.{" "}
        <button className="underline" onClick={() => void query.refetch()}>
          Try again
        </button>
      </p>
    )
  }
  if (!query.data?.shouldShow) return null
  return (
    <React.Suspense fallback={null}>
      <WelcomeModal {...props} initiallyOpen />
    </React.Suspense>
  )
}

export { DashboardWelcome }
