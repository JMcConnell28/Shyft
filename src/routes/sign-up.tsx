import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { SparklesIcon } from "lucide-react"

import { AuthShell } from "@/components/app/auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { authClient } from "@/lib/auth-client"
import { getSession } from "@/lib/auth-server"
import { isPublicDevelopmentEmailVerificationBypassed } from "@/lib/email-verification"
import { createZodFieldValidator } from "@/lib/validation"
import { personNameSchema, emailSchema, passwordSchema } from "@/lib/onboarding-schemas"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FieldGroup,
} from "@/components/ui/field"

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
      { title: "Sign Up | Shyft" },
      {
        name: "description",
        content:
          "Create your Shyft account and verify your email before joining or creating an organization.",
      },
    ],
  }),
  component: SignUpRoute,
})

function SignUpRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const signUpResult = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
        callbackURL: search.redirect,
      })

      if (signUpResult.error) {
        setError(signUpResult.error.message ?? "Unable to create account.")
        return
      }

      if (isPublicDevelopmentEmailVerificationBypassed()) {
        if (typeof window !== "undefined") {
          window.location.href = search.redirect
        }
        return
      }

      await navigate({
        to: "/verify-email",
        search: {
          email: value.email,
          redirect: search.redirect,
        },
      })
    },
  })

  return (
    <AuthShell
      badge="Get started"
      eyebrow="Create account"
      title="Create your account first. Organization setup comes next."
      description="Start with your Shyft account, verify your email, then choose whether to create a workplace or join one with an invite."
      alternateLabel="Already have an account?"
      alternateHref="/login"
    >
      <Card className="border border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <SparklesIcon className="size-3" />
            Account-first onboarding
          </Badge>
          <CardTitle className="mt-2 text-2xl">Create your Shyft account</CardTitle>
          <CardDescription>
            Verify your email, then decide whether to create an organization or
            join one with an invite.
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
              name="name"
              validators={{
                onSubmit: createZodFieldValidator(personNameSchema),
              }}
            >
              {(field) => (
                <TextFormField
                  field={field}
                  label="Full name"
                  placeholder="Jane Smith"
                  autoComplete="name"
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
                  placeholder="Create a password"
                  autoComplete="new-password"
                  description="Use a password you will remember on mobile and desktop."
                  required
                />
              )}
            </form.Field>
          </FieldGroup>

          <FormErrorMessage message={error} />

          <div className="space-y-3">
            <FormSubmitButton
              className="w-full"
              isSubmitting={form.state.isSubmitting}
              submittingText="Creating account..."
            >
              Create account
            </FormSubmitButton>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              type="button"
              disabled
            >
              Continue with Google
            </Button>
          </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
