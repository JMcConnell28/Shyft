import { createFileRoute, redirect } from "@tanstack/react-router"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmployeeClockPage } from "@/features/time-clock/components/employee-clock-page"
import { getClockScanPageData } from "@/features/time-clock/server-fns"
import { clockScanSearchSchema } from "@/features/time-clock/schemas/clock-scan-schemas"
import { getViewerState } from "@/lib/onboarding"

export const Route = createFileRoute("/clock")({
  validateSearch: (search) => clockScanSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    const viewer = await getViewerState()

    if (!viewer) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }

    if (!viewer.user.emailVerified) {
      throw redirect({
        to: "/verify-email",
        search: {
          email: viewer.user.email,
          redirect: location.href,
          sent: false,
        },
      })
    }

    return { viewer }
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getClockScanPageData({ data: deps }),
  head: () => ({
    meta: [
      {
        title: "Clock in | RocketRota",
      },
    ],
  }),
  component: ClockRoute,
})

function ClockRoute() {
  const { viewer } = Route.useRouteContext()
  const pageData = Route.useLoaderData()

  if (pageData.status === "error") {
    return (
      <ClockErrorPage message={pageData.message} title={pageData.title} />
    )
  }

  return (
    <EmployeeClockPage
      initialData={pageData.clock}
      scanSessionId={pageData.clock.scanSessionId}
      userId={viewer.user.id}
    />
  )
}

function ClockErrorPage({
  message,
  title,
}: {
  message: string
  title: string
}) {
  return (
    <div className="min-h-dvh bg-muted/20 px-4 py-5 text-foreground">
      <main className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md flex-col justify-center">
        <Card className="border-border/70 bg-background shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-primary">RocketRota</p>
              <h1 className="mt-2 text-xl font-semibold">{title}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <a className={buttonVariants()} href="/dashboard">
                Back to dashboard
              </a>
              <a className={buttonVariants({ variant: "outline" })} href="/help">
                Get help
              </a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
