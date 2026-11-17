import * as React from "react"
import { Link, createFileRoute, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  SetupAuthShell,
  setupAuthPrimaryButtonClassName,
  setupAuthSecondaryButtonClassName,
} from "@/components/app/setup-auth-shell"
import { SignOutButton } from "@/components/app/sign-out-button"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { Button, buttonVariants } from "@/components/ui/button"
import { getSession } from "@/lib/auth-server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { getErrorMessage } from "@/lib/errors"
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
      signedInEmail: session?.user.email ?? null,
    }
  },
  head: () => ({
    meta: [
      { title: "Accept Invitation | RocketRota" },
      {
        name: "description",
        content:
          "Accept an invitation to join your organisation on RocketRota.",
      },
    ],
  }),
  component: AcceptInvitationRoute,
})

function AcceptInvitationRoute() {
  const { invitationId, signedInEmail } = Route.useLoaderData()
  const acceptInvitationFn = useServerFn(acceptOrganizationInvitation)
  const [error, setError] = React.useState<string | null>(null)
  const [isAccepting, setIsAccepting] = React.useState(false)
  const invitationPath = `/accept-invitation/${invitationId}`

  async function handleAccept() {
    setError(null)
    setIsAccepting(true)

    try {
      const result = await acceptInvitationFn({
        data: {
          invitationId,
        },
      })

      window.location.href = result.redirectTo
    } catch (acceptError) {
      setError(
        getErrorMessage(acceptError, "We could not accept that invitation.")
      )
      setIsAccepting(false)
    }
  }

  return (
    <SetupAuthShell
      title="Accept your invitation"
      description={
        signedInEmail ? (
          <>
            You’re signed in as{" "}
            <strong className="font-semibold wrap-anywhere">
              {signedInEmail}
            </strong>
            . Use the account that received the invitation.
          </>
        ) : (
          "Sign in or create an account with the email address that received the invitation."
        )
      }
      headerAction={signedInEmail ? <SignOutButton /> : undefined}
    >
      {signedInEmail ? (
        <div className="space-y-3">
          {error ? (
            <div role="alert">
              <FormErrorMessage message={error} />
            </div>
          ) : null}
          <Button
            className={setupAuthPrimaryButtonClassName}
            onClick={() => void handleAccept()}
            disabled={isAccepting}
          >
            {isAccepting ? "Accepting invitation..." : "Accept invitation"}
          </Button>
          <Link
            to="/dashboard"
            className={cn(
              buttonVariants({ variant: "outline" }),
              setupAuthSecondaryButtonClassName
            )}
          >
            Back to workspace
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <Link
            to="/login"
            search={{ redirect: invitationPath }}
            className={cn(buttonVariants(), setupAuthPrimaryButtonClassName)}
          >
            Sign in
          </Link>
          <Link
            to="/sign-up"
            search={{ redirect: invitationPath }}
            className={cn(
              buttonVariants({ variant: "outline" }),
              setupAuthSecondaryButtonClassName
            )}
          >
            Create account
          </Link>
        </div>
      )}
    </SetupAuthShell>
  )
}
