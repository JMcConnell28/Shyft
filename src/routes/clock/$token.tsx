import { createFileRoute } from "@tanstack/react-router"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const Route = createFileRoute("/clock/$token")({
  head: () => ({
    meta: [
      {
        title: "Clock link expired | RocketRota",
      },
    ],
  }),
  component: OldClockLinkRoute,
})

function OldClockLinkRoute() {
  return (
    <div className="min-h-dvh bg-muted/20 px-4 py-5 text-foreground">
      <main className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-md flex-col justify-center">
        <Card className="border-border/70 bg-background shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-sm font-semibold text-primary">RocketRota</p>
              <h1 className="mt-2 text-xl font-semibold">
                This clock link is no longer used
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Tap the NTAG 424 clock card again to create a fresh secure
                clock session.
              </p>
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
