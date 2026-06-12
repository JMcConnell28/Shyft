import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { createFileRoute, Link, redirect } from "@tanstack/react-router"
import { ArrowRightIcon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { FieldGroup } from "@/components/ui/field"
import { authClient } from "@/lib/auth-client"
import { getSession } from "@/lib/auth-server"
import { isPublicDevelopmentEmailVerificationBypassed } from "@/lib/email-verification"
import { saveOnboardingIntent } from "@/lib/onboarding"
import {
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
    <OnboardingShell
      badge="Create account"
      eyebrow="Step 1"
      title="Start with your account."
      description="Add the basics now. RocketRota will ask one setup question at a time after this."
      progress={15}
      showBackToDashboard={false}
    >
      <form
        className="rounded-xl border border-border/70 bg-background p-3 shadow-sm sm:p-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
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

        <div className="mt-4 space-y-3">
          <FormSubmitButton
            className="w-full"
            isSubmitting={form.state.isSubmitting}
            submittingText="Creating account..."
          >
            Continue
            <ArrowRightIcon />
          </FormSubmitButton>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              search={{ redirect: redirectTarget }}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </OnboardingShell>
  )
}
