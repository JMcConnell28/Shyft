"use client"

import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Clock3Icon } from "lucide-react"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { OnboardingShell } from "@/components/app/onboarding-shell"
import { OrganizationSwitcherList } from "@/features/navigation/components/organization-switcher-list"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ownJoinRequestQueryOptions } from "@/features/join-approvals/query-options"
import { getErrorMessage } from "@/lib/errors"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { cn } from "@/lib/utils"

function JoinRequestStatusPage({
  requestId,
  organizations,
}: {
  requestId: string
  organizations: Array<OrganizationSummary>
}) {
  const requestQuery = useQuery(ownJoinRequestQueryOptions(requestId))
  const request = requestQuery.data
  const isPending = request?.status === "pending"

  return (
    <OnboardingShell
      badge="Workplace request"
      eyebrow="Join workplace"
      title={
        isPending
          ? "Your request is waiting for approval."
          : request?.status === "approved"
            ? "Your request was approved."
            : request?.status === "denied"
              ? "Your request was denied."
              : "Checking your request..."
      }
      description={
        isPending
          ? "A manager needs to approve your request before you can enter this workplace. This page checks for updates automatically and stays open while you wait."
          : request?.status === "approved"
            ? "You can now open your workplace."
            : request?.status === "denied"
              ? "Contact your manager if you think this was a mistake."
              : "Please wait while we load your request."
      }
      progress={isPending ? 90 : 100}
      hideBackLink={isPending}
      showSignOut
    >
      <div className="space-y-4">
        <Card className="rounded-3xl border-border/60 bg-background/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock3Icon className="size-5" />
              {request?.organizationName ?? "Workplace approval"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requestQuery.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {getErrorMessage(
                  requestQuery.error,
                  "We could not load your request."
                )}
              </p>
            ) : request ? (
              <p className="text-sm text-muted-foreground">
                {request.locationName} · {request.staffGroupName}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Loading request...
              </p>
            )}
            {isPending ? (
              <Button
                variant="outline"
                disabled={requestQuery.isFetching}
                onClick={() => void requestQuery.refetch()}
              >
                {requestQuery.isFetching ? "Checking..." : "Check again"}
              </Button>
            ) : request?.status === "approved" ? (
              <a
                href={getOrganizationDashboardPath(request.organizationSlug)}
                className={cn(buttonVariants(), "w-fit")}
              >
                Open workplace
              </a>
            ) : request?.status === "denied" ? (
              <Link
                to="/dashboard"
                className={cn(buttonVariants({ variant: "outline" }), "w-fit")}
              >
                Back to dashboard
              </Link>
            ) : null}
          </CardContent>
        </Card>
        {isPending && organizations.length > 0 ? (
          <Card className="rounded-3xl border-border/60 bg-background/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">
                Your existing organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationSwitcherList
                organizations={organizations}
                activeOrganizationId={null}
              />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </OnboardingShell>
  )
}

export { JoinRequestStatusPage }
