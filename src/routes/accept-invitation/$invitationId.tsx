import * as React from "react"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { MailPlusIcon } from "lucide-react"

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
import { getSession } from "@/lib/auth-server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { acceptOrganizationInvitation } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/accept-invitation/$invitationId")({
  loader: async ({ params }) => {
    const session = await getSession()

    if (session && !isEmailVerificationSatisfied(session.user.emailVerified)) {
      throw redirect({
        to: "/verify-email",
        search: {
          email: session.user.email,
          redirect: `/accept-invitation/${params.invitationId}`,
          sent: false,
        },
      })
    }

    return {
      invitationId: params.invitationId,
      session,
    }
  },
  head: () => ({
    meta: [
      { title: "Accept Invitation | RocketRota" },
      {
        name: "description",
        content: "Accept a Better Auth organization invitation in RocketRota.",
      },
    ],
  }),
  component: AcceptInvitationRoute,
})

function AcceptInvitationRoute() {
  const loaderData = Route.useLoaderData()
  const acceptInvitationFn = useServerFn(acceptOrganizationInvitation)
  const [error, setError] = React.useState<string | null>(null)
  const [isAccepting, setIsAccepting] = React.useState(false)

  async function handleAccept() {
    setError(null)
    setIsAccepting(true)

    try {
      const result = await acceptInvitationFn({
        data: {
          invitationId: loaderData.invitationId,
        },
      })

      window.location.href = result.redirectTo
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "We could not accept that invitation.",
      )
      setIsAccepting(false)
    }
  }

  return (
    <OnboardingShell
      badge="Organization invite"
      eyebrow="Accept invitation"
      title="Join your organization on RocketRota."
      description="Manager and admin invites are handled through Better Auth. Once accepted, you will land in the right active workspace."
      progress={75}
    >
      <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <MailPlusIcon className="size-3" />
            Email invitation
          </Badge>
          <CardTitle className="mt-2 text-2xl">Accept your invitation</CardTitle>
          <CardDescription>
            Sign in or create your account first if you have not done that yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {!loaderData.session ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                search={{ redirect: `/accept-invitation/${loaderData.invitationId}` }}
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                Sign in to continue
              </Link>
              <Link
                to="/sign-up"
                search={{ redirect: `/accept-invitation/${loaderData.invitationId}` }}
                className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
              >
                Create account first
              </Link>
            </div>
          ) : (
            <Button
              className="w-full sm:w-auto"
              onClick={() => void handleAccept()}
              disabled={isAccepting}
            >
              {isAccepting ? "Accepting invitation..." : "Accept invitation"}
            </Button>
          )}
        </CardContent>
      </Card>
    </OnboardingShell>
  )
}
