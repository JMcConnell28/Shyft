import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { MailCheckIcon } from "lucide-react"

import { AuthShell } from "@/components/app/auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { getSession } from "@/lib/auth-server"
import { isEmailVerificationSatisfied } from "@/lib/email-verification"
import { getErrorMessage } from "@/lib/errors"
import { resendVerificationEmail } from "@/lib/onboarding"
import { emailSchema } from "@/lib/onboarding-schemas"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"

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
  }),
  loader: async ({ location }) => {
    const rawSearch = location.search as {
      email?: string
      redirect?: string
    }
    const search = {
      email: typeof rawSearch.email === "string" && rawSearch.email.length > 0
        ? rawSearch.email
        : "",
      redirect:
        typeof rawSearch.redirect === "string" && rawSearch.redirect.length > 0
          ? rawSearch.redirect
          : "/dashboard",
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
    }
  },
  head: () => ({
    meta: [
      { title: "Verify Email | Shyft" },
      {
        name: "description",
        content: "Verify your email address to continue into Shyft.",
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
            "We could not send another verification email.",
          ),
        )
      }
    },
  })

  return (
    <AuthShell
      badge="Almost there"
      eyebrow="Verify email"
      title="Check your inbox before you create or join a workplace."
      description="We sent a verification link to your email. Once you confirm it, Shyft will take you back to the right onboarding step automatically."
      alternateLabel="Need to use a different account?"
      alternateHref="/login"
    >
      <Card className="border border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <MailCheckIcon className="size-3" />
            Email verification
          </Badge>
          <CardTitle className="mt-2 text-2xl">Verify your email</CardTitle>
          <CardDescription>
            Use the link in your inbox to unlock organization creation and
            invitation acceptance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
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
                className="w-full"
                isSubmitting={form.state.isSubmitting}
                submittingText="Sending email..."
              >
                Resend verification email
              </FormSubmitButton>
              <a
                href={loaderData.redirect}
                className="inline-flex h-8 w-full items-center justify-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-input/50"
              >
                I have already verified
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
