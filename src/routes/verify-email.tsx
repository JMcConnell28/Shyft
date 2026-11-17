import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  SetupAuthShell,
  setupAuthPrimaryButtonClassName,
  setupAuthSecondaryButtonClassName,
} from "@/components/app/setup-auth-shell"
import { SignOutButton } from "@/components/app/sign-out-button"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { buttonVariants } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { getSession } from "@/lib/auth-server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { getErrorMessage } from "@/lib/errors"
import { resendVerificationEmail } from "@/lib/onboarding"
import { emailSchema } from "@/lib/onboarding-schemas"
import { showSuccessToast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { createZodFieldValidator } from "@/lib/validation"
import { invalidateNavigationCache } from "@/features/navigation/invalidate-navigation-cache"
import { verificationSearchSchema } from "@/features/account/schemas/authentication-search-schemas"

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => verificationSearchSchema.parse(search),
  loader: async ({ context, location }) => {
    await invalidateNavigationCache(context.queryClient)
    const search = verificationSearchSchema.parse(location.search)
    const session = await getSession()

    if (session && isEmailVerificationSatisfied(session.user.emailVerified)) {
      throw redirect({
        href: search.redirect,
      })
    }

    return {
      email: search.email || session?.user.email || "",
      redirect: search.redirect,
      sent: search.sent,
      hasSession: Boolean(session),
    }
  },
  head: () => ({
    meta: [
      { title: "Verify Email | RocketRota" },
      {
        name: "description",
        content: "Verify your email address to continue into RocketRota.",
      },
    ],
  }),
  component: VerifyEmailRoute,
})

function VerifyEmailRoute() {
  const loaderData = Route.useLoaderData()
  const resendVerificationEmailFn = useServerFn(resendVerificationEmail)
  const [error, setError] = React.useState<string | null>(null)
  const [resentEmail, setResentEmail] = React.useState<string | null>(null)
  const sentEmail = resentEmail ?? (loaderData.sent ? loaderData.email : null)

  const form = useForm({
    defaultValues: {
      email: loaderData.email,
      callbackURL: loaderData.redirect,
    },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        await resendVerificationEmailFn({
          data: {
            email: value.email,
            callbackURL: value.callbackURL,
          },
        })
        setResentEmail(value.email)
        showSuccessToast("Verification email sent. Check your inbox.")
      } catch (submissionError) {
        setError(
          getErrorMessage(
            submissionError,
            "We could not send another verification email."
          )
        )
      }
    },
  })

  return (
    <SetupAuthShell
      title={sentEmail !== null ? "Check your inbox" : "Verify your email"}
      description={
        sentEmail ? (
          <>
            Open the verification link we sent to{" "}
            <strong className="font-semibold wrap-anywhere">{sentEmail}</strong>{" "}
            to continue.
          </>
        ) : (
          "Open the verification link in your inbox or request another below."
        )
      }
      headerAction={loaderData.hasSession ? <SignOutButton /> : undefined}
      alternate={
        loaderData.hasSession
          ? undefined
          : {
              label: "Already verified?",
              action: "Back to sign in",
              to: "/login",
              redirect: loaderData.redirect,
            }
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="email"
            validators={{
              onSubmit: createZodFieldValidator(emailSchema),
            }}
          >
            {(field) => (
              <TextFormField
                field={field}
                label="Email address"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
              />
            )}
          </form.Field>
        </FieldGroup>

        {error ? (
          <div role="alert">
            <FormErrorMessage message={error} />
          </div>
        ) : null}
        <div className="space-y-2">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <FormSubmitButton
                className={setupAuthPrimaryButtonClassName}
                isSubmitting={isSubmitting}
                submittingText="Sending email..."
              >
                Resend verification email
              </FormSubmitButton>
            )}
          </form.Subscribe>
          <a
            href={loaderData.redirect}
            className={cn(
              buttonVariants({ variant: "outline" }),
              setupAuthSecondaryButtonClassName
            )}
          >
            I’ve verified my email
          </a>
        </div>
      </form>
    </SetupAuthShell>
  )
}
