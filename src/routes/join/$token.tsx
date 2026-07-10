import * as React from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { BadgeCheckIcon, Building2Icon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  acceptStaffInvite,
  getStaffInvitePreview,
  getViewerState,
} from "@/lib/onboarding"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/join/$token")({
  loader: async ({ params }) => {
    const [preview, viewer] = await Promise.all([
      getStaffInvitePreview({
        data: {
          token: params.token,
        },
      }),
      getViewerState(),
    ])

    if (viewer && !viewer.user.emailVerified) {
      throw redirect({
        to: "/verify-email",
        search: {
          email: viewer.user.email,
          redirect: `/join/${params.token}`,
          sent: false,
        },
      })
    }

    return {
      preview,
      viewer,
      token: params.token,
    }
  },
  head: () => ({
    meta: [
      { title: "Join Workplace | RocketRota" },
      {
        name: "description",
        content: "Join a RocketRota workplace using a staff invitation link.",
      },
    ],
  }),
  component: JoinInviteRoute,
})

function JoinInviteRoute() {
  const loaderData = Route.useLoaderData()
  const acceptStaffInviteFn = useServerFn(acceptStaffInvite)
  const [error, setError] = React.useState<string | null>(null)
  const [isJoining, setIsJoining] = React.useState(false)

  async function handleJoin() {
    setError(null)
    setIsJoining(true)

    try {
      const result = await acceptStaffInviteFn({
        data: {
          token: loaderData.token,
        },
      })

      window.location.href = result.redirectTo
    } catch (joinError) {
      setError(
        joinError instanceof Error
          ? joinError.message
          : "We could not join that workplace.",
      )
      setIsJoining(false)
    }
  }

  if (!loaderData.preview) {
    return (
      <OnboardingShell
        badge="Invite unavailable"
        eyebrow="Join workplace"
        title="This invite link is no longer valid."
        description="Ask your manager for a fresh RocketRota invite link and try again."
        progress={10}
      >
        <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
          <CardContent className="pt-6">
            <Link
              to="/dashboard"
              className="inline-flex h-8 w-full items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Go to dashboard
            </Link>
          </CardContent>
        </Card>
      </OnboardingShell>
    )
  }

  return (
    <OnboardingShell
      badge="Workplace invite"
      eyebrow="Join workplace"
      title={`Join ${loaderData.preview.organizationName} on RocketRota.`}
      description="This invite will place you into the correct workplace, location, and default staff group."
      progress={80}
    >
      <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <Building2Icon className="size-3" />
            Invitation details
          </Badge>
          <CardTitle className="mt-2 text-2xl">Review your invite</CardTitle>
          <CardDescription>
            Confirm the workplace details below before joining.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Organization</p>
              <p className="text-sm text-muted-foreground">
                {loaderData.preview.organizationName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Location</p>
              <p className="text-sm text-muted-foreground">
                {loaderData.preview.locationName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Default group</p>
              <p className="text-sm text-muted-foreground">
                {loaderData.preview.staffGroupName}
              </p>
            </div>
          </div>

          {loaderData.preview.isDisabled || loaderData.preview.isExpired ? (
            <p className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
              This invite is no longer active. Ask your manager for a fresh link.
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!loaderData.viewer ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                search={{ redirect: `/join/${loaderData.token}` }}
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                Sign in to join
              </Link>
              <Link
                to="/sign-up"
                search={{ redirect: `/join/${loaderData.token}` }}
                className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
              >
                Create account first
              </Link>
            </div>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={() => void handleJoin()}
              disabled={
                isJoining ||
                loaderData.preview.isDisabled ||
                loaderData.preview.isExpired
              }
            >
              <BadgeCheckIcon />
              {isJoining ? "Joining workplace..." : "Join workplace"}
            </Button>
          )}
        </CardContent>
      </Card>
    </OnboardingShell>
  )
}
