import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { LockKeyholeIcon } from "lucide-react"

import { AuthShell } from "@/components/app/auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { authClient } from "@/lib/auth-client"
import { getSession } from "@/lib/auth-server"
import { isPublicDevelopmentEmailVerificationBypassed } from "@/lib/email-verification"
import { createZodFieldValidator } from "@/lib/validation"
import { emailSchema, passwordSchema } from "@/lib/onboarding-schemas"
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

export const Route = createFileRoute("/login")({
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
      { title: "Login | Shyft" },
      {
        name: "description",
        content:
          "Log in to your Shyft workspace.",
      },
    ],
  }),
  component: LoginRoute,
})

function LoginRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const [error, setError] = React.useState<string | null>(null)
  const [isPasskeyPending, setIsPasskeyPending] = React.useState(false)

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof PublicKeyCredential === "undefined" ||
      typeof PublicKeyCredential.isConditionalMediationAvailable !== "function"
    ) {
      return
    }

    void PublicKeyCredential.isConditionalMediationAvailable().then(
      (isAvailable) => {
        if (!isAvailable) {
          return
        }

        void authClient.signIn.passkey({ autoFill: true })
      }
    )
  }, [])

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      const result = await authClient.signIn.email({
        email: value.email,
        password: value.password,
        callbackURL: search.redirect,
      })

      if (result.error) {
        if (
          !isPublicDevelopmentEmailVerificationBypassed() &&
          typeof result.error.message === "string" &&
          result.error.message.toLowerCase().includes("verify")
        ) {
          await navigate({
            to: "/verify-email",
            search: {
              email: value.email,
              redirect: search.redirect,
            },
          })
          return
        }

        setError(result.error.message ?? "Unable to sign in.")
        return
      }

      if (typeof window !== "undefined") {
        window.location.href = search.redirect
      }
    },
  })

  async function handlePasskeySignIn() {
    setError(null)
    setIsPasskeyPending(true)

    const result = await authClient.signIn.passkey()

    setIsPasskeyPending(false)

    if (result.error) {
      const errorCode =
        "code" in result.error ? result.error.code : undefined

      setError(
        errorCode === "AUTH_CANCELLED"
          ? "Passkey sign-in was cancelled."
          : typeof result.error.message === "string"
            ? result.error.message
            : "Unable to sign in with a passkey."
      )
      return
    }

    if (typeof window !== "undefined") {
      window.location.href = search.redirect
    }
  }

  return (
    <AuthShell
      badge="Welcome back"
      eyebrow="Sign in"
      title="Sign in to manage schedules, staff, and venues."
      description="Access your Shyft workspace to publish rotas, review changes, and keep your team aligned."
      alternateLabel="Need an account?"
      alternateHref="/sign-up"
    >
      <Card className="border border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <LockKeyholeIcon className="size-3" />
            Secure workspace access
          </Badge>
          <CardTitle className="mt-2 text-2xl">Sign in to Shyft</CardTitle>
          <CardDescription>
            Sign in with your account, then continue into your active Shyft
            workspace or invitation flow.
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
                  label="Work email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="username webauthn"
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
                  placeholder="Enter your password"
                  autoComplete="current-password webauthn"
                  description="Your Shyft account is scoped to your organization workspace."
                  required
                />
              )}
            </form.Field>
          </FieldGroup>

          <FormErrorMessage message={error} />

          <div className="space-y-3">
            <FormSubmitButton
              className="w-full"
              isSubmitting={form.state.isSubmitting || isPasskeyPending}
              submittingText="Signing in..."
            >
              Sign in
            </FormSubmitButton>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              type="button"
              onClick={() => void handlePasskeySignIn()}
              disabled={form.state.isSubmitting || isPasskeyPending}
            >
              Use passkey
            </Button>
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
