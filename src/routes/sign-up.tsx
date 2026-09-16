import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { ArrowRightIcon, UserPlusIcon } from "lucide-react"

import { AuthCard, authButtonClassName } from "@/components/app/auth-card"
import { AuthShell } from "@/components/app/auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { FieldGroup } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { getSession } from "@/lib/auth-server"
import { isPublicDevelopmentEmailVerificationBypassed } from "@/lib/email-verification"
import { saveOnboardingIntent } from "@/lib/onboarding"
import {
  dateOfBirthSchema,
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  passwordSchema,
  signUpSchema,
} from "@/lib/onboarding-schemas"
import { createZodFieldValidator } from "@/lib/validation"

type SignupIntent = "manage" | "join"

export const Route = createFileRoute("/sign-up")({
  validateSearch: (search) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.length > 0
        ? search.redirect
        : "/dashboard",
  }),
  beforeLoad: async () => {
    const session = await getSession()

    if (session) {
      throw redirect({ to: "/dashboard" })
    }
  },
  head: () => ({
    meta: [
      { title: "Sign Up | RocketRota" },
      {
        name: "description",
        content:
          "Create your RocketRota account and continue into quick rota setup.",
      },
    ],
  }),
  component: SignUpRoute,
})

function SignUpRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const saveOnboardingIntentFn = useServerFn(saveOnboardingIntent)
  const [error, setError] = React.useState<string | null>(null)

  const redirectTarget =
    search.redirect !== "/dashboard" ? search.redirect : "/onboarding/setup"
  const intent: SignupIntent = redirectTarget.includes("/join")
    ? "join"
    : "manage"

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const parsed = signUpSchema.safeParse(value)

      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Check your details.")
        return
      }

      const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`
      const signUpResult = await authClient.signUp.email({
        name: fullName,
        email: parsed.data.email,
        password: parsed.data.password,
        dateOfBirth: parsed.data.dateOfBirth,
        callbackURL: redirectTarget,
      })

      if (signUpResult.error) {
        setError(signUpResult.error.message ?? "Unable to create account.")
        return
      }

      await saveOnboardingIntentFn({
        data: {
          email: parsed.data.email,
          intent,
        },
      })

      if (isPublicDevelopmentEmailVerificationBypassed()) {
        if (typeof window !== "undefined") {
          window.location.href = redirectTarget
        }
        return
      }

      await navigate({
        to: "/verify-email",
        search: {
          email: parsed.data.email,
          redirect: redirectTarget,
          sent: true,
        },
      })
    },
  })

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your RocketRota account"
      description="Add your details now, then we’ll guide you through the workplace setup that fits your team."
      alternateLabel="Already have an account?"
      alternateAction="Sign in"
      alternateHref="/login"
      alternateRedirect={redirectTarget}
      contentWidth="wide"
    >
      <AuthCard
        icon={UserPlusIcon}
        title="Your details"
        description="Use the email address you want connected to your workplace."
      >
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="firstName"
                validators={{
                  onSubmit: createZodFieldValidator(firstNameSchema),
                }}
              >
                {(field) => (
                  <TextFormField
                    field={field}
                    label="First name"
                    placeholder="Jane"
                    autoComplete="given-name"
                    required
                  />
                )}
              </form.Field>

              <form.Field
                name="lastName"
                validators={{
                  onSubmit: createZodFieldValidator(lastNameSchema),
                }}
              >
                {(field) => (
                  <TextFormField
                    field={field}
                    label="Last name"
                    placeholder="Smith"
                    autoComplete="family-name"
                    required
                  />
                )}
              </form.Field>
            </div>

            <form.Field
              name="dateOfBirth"
              validators={{
                onSubmit: createZodFieldValidator(dateOfBirthSchema),
              }}
            >
              {(field) => (
                <TextFormField
                  field={field}
                  label="Date of birth"
                  type="date"
                  autoComplete="bday"
                  required
                />
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onSubmit: createZodFieldValidator(emailSchema),
              }}
            >
              {(field) => (
                <TextFormField
                  field={field}
                  label="Work email"
                  type="email"
                  placeholder="jane@company.com"
                  autoComplete="email"
                  required
                />
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onSubmit: createZodFieldValidator(passwordSchema),
              }}
            >
              {(field) => (
                <TextFormField
                  field={field}
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                />
              )}
            </form.Field>
          </FieldGroup>

          <FormErrorMessage message={error} />

          <FormSubmitButton
            className={authButtonClassName}
            isSubmitting={form.state.isSubmitting}
            submittingText="Creating account..."
          >
            Continue
            <ArrowRightIcon />
          </FormSubmitButton>
        </form>
      </AuthCard>
    </AuthShell>
  )
}
