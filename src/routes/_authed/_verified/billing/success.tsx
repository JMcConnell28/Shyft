import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { BrandLockup } from "@/components/app/brand"
import { BillingSuccessPanel } from "@/features/billing/components/billing-success-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getLocationDashboardPath,
  getOrganizationDashboardPath,
} from "@/lib/organization-paths"

const verifiedRouteApi = getRouteApi("/_authed/_verified")
const billingSuccessSearchSchema = z.object({
  session_id: z.string().optional(),
})

export const Route = createFileRoute("/_authed/_verified/billing/success")({
  validateSearch: (search) => billingSuccessSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (!context.viewer.activeWorkspace) {
      throw redirect({ to: "/onboarding/setup" })
    }
  },
  head: () => ({
    meta: [
      { title: "Billing Active | RocketRota" },
      {
        name: "description",
        content: "Your RocketRota subscription is being activated.",
      },
    ],
  }),
  component: BillingSuccessRoute,
})

function BillingSuccessRoute() {
  const { viewer } = verifiedRouteApi.useRouteContext()
  const search = Route.useSearch()
  const workspace = viewer.activeWorkspace
  const dashboardHref =
    workspace?.type === "location"
      ? getLocationDashboardPath(workspace.slug)
      : workspace
        ? getOrganizationDashboardPath(workspace.slug)
        : "/dashboard"

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-5 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-2.5rem)] w-full max-w-xl flex-col">
        <BrandLockup compact />

        <div className="flex flex-1 items-center py-8">
          <Card className="w-full border-border/70 bg-background shadow-sm">
            <CardHeader className="space-y-4">
              <CardTitle className="sr-only">Billing confirmation</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingSuccessPanel
                checkoutSessionId={search.session_id}
                dashboardHref={dashboardHref}
                initialBilling={viewer.billing}
                organizationId={workspace?.type === "organization" ? workspace.id : null}
                locationId={workspace?.type === "location" ? workspace.id : null}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
