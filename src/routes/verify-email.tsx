import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { MailCheckIcon } from "lucide-react"

import {
  AuthCard,
  AuthStatusMessage,
  authButtonClassName,
} from "@/components/app/auth-card"
import { AuthShell } from "@/components/app/auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { FieldGroup } from "@/components/ui/field"
import { getSession } from "@/lib/auth-server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { getErrorMessage } from "@/lib/errors"
import { resendVerificationEmail } from "@/lib/onboarding"
import { emailSchema } from "@/lib/onboarding-schemas"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"
import { navigationQueryKeys } from "@/features/navigation/query-keys"

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search) => ({
    email:
      typeof search.email === "string" && search.email.length > 0
        ? search.email
        : "",
    redirect:
      typeof search.redirect === "string" && search.redirect.length > 0
        ? search.redirect
        : "/dashboard",
    sent: search.sent === "1" || search.sent === true,
  }),
  loader: async ({ context, location }) => {
    context.queryClient.removeQueries({ queryKey: navigationQueryKeys.all })
    const rawSearch = location.search as {
      email?: string
      redirect?: string
      sent?: boolean | string
    }
    const search = {
      email:
        typeof rawSearch.email === "string" && rawSearch.email.length > 0
          ? rawSearch.email
          : "",
      redirect:
        typeof rawSearch.redirect === "string" && rawSearch.redirect.length > 0
          ? rawSearch.redirect
          : "/dashboard",
      sent: rawSearch.sent === "1" || rawSearch.sent === true,
    }
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
    <AuthShell
      eyebrow="Almost there"
      title="Verify your email"
      description="We sent a verification link to your email. Once you confirm it, RocketRota will take you back to the right onboarding step automatically."
      alternateLabel="Need to use a different account?"
      alternateAction="Back to sign in"
      alternateHref="/login"
      alternateRedirect={loaderData.redirect}
    >
      <AuthCard
        icon={MailCheckIcon}
        title="Check your inbox"
        description={
          loaderData.sent
            ? "Open the verification link we just sent to continue."
            : "Use the link in your inbox to unlock workplace setup and invitations."
        }
      >
        <div className="space-y-5">
          {loaderData.sent ? (
            <AuthStatusMessage>
              Verification email sent to{" "}
              <span className="font-bold">{loaderData.email}</span>. After
              verifying, you will continue to the right onboarding step.
            </AuthStatusMessage>
          ) : null}

          <form
            className="space-y-5"
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

            <FormErrorMessage message={error} />

            <div className="space-y-3">
              <FormSubmitButton
                className={authButtonClassName}
                isSubmitting={form.state.isSubmitting}
                submittingText="Sending email..."
              >
                Resend verification email
              </FormSubmitButton>
              <a
                href={loaderData.redirect}
                className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#dfe4ef] bg-white px-3 text-sm font-bold text-[#10204b] transition-colors hover:bg-[#f8faff]"
              >
                I have already verified
              </a>
            </div>
          </form>
        </div>
      </AuthCard>
    </AuthShell>
  )
}
