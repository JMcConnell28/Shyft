import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Link, createFileRoute, redirect } from "@tanstack/react-router"

import { AuthShell } from "@/components/app/auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { authClient } from "@/lib/auth-client"
import { getSession } from "@/lib/auth-server"
import { createZodFieldValidator } from "@/lib/validation"
import { emailSchema, passwordSchema } from "@/lib/onboarding-schemas"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"

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
      { title: "Login | RocketRota" },
      {
        name: "description",
        content: "Log in to your RocketRota workspace.",
      },
    ],
  }),
  component: LoginRoute,
})

function LoginRoute() {
  const search = Route.useSearch()
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
      const errorCode = "code" in result.error ? result.error.code : undefined

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
      description="Access your RocketRota workspace to publish rotas, review changes, and keep your team aligned."
      alternateLabel="Need an account?"
      alternateHref="/sign-up"
      compactOnMobile
    >
      <Card className="gap-0 overflow-visible rounded-none border-0 bg-transparent py-0 shadow-none ring-0 lg:gap-4 lg:overflow-hidden lg:rounded-lg lg:border lg:border-border/60 lg:bg-background/90 lg:py-4 lg:shadow-2xl lg:ring-1 lg:shadow-slate-950/10 lg:ring-foreground/10 lg:backdrop-blur">
        <CardHeader className="hidden px-0 lg:grid lg:px-6">
          <CardTitle className="text-2xl">Sign in to RocketRota</CardTitle>
          <CardDescription>
            Enter your details to continue to your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-0 lg:space-y-5 lg:px-6">
          <form
            className="space-y-6 lg:space-y-5"
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
                    className="gap-2"
                    inputClassName="h-12 rounded-xl bg-muted/40 px-4 text-base shadow-none md:text-base lg:h-7 lg:rounded-md lg:px-2 lg:text-xs/relaxed"
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
                    required
                    className="gap-2"
                    inputClassName="h-12 rounded-xl bg-muted/40 px-4 text-base shadow-none md:text-base lg:h-7 lg:rounded-md lg:px-2 lg:text-xs/relaxed"
                  />
                )}
              </form.Field>
            </FieldGroup>

            <FormErrorMessage message={error} />

            <div className="space-y-3 pt-1">
              <div className="flex justify-end">
                <Button
                  variant="link"
                  size="sm"
                  className="h-10 px-1 text-sm lg:h-auto lg:px-0 lg:text-xs/relaxed"
                  nativeButton={false}
                  render={<Link to="/forgot-password" />}
                >
                  Forgot password?
                </Button>
              </div>
              <FormSubmitButton
                className="h-12 w-full rounded-xl text-sm lg:h-8 lg:rounded-md lg:text-xs/relaxed"
                isSubmitting={form.state.isSubmitting || isPasskeyPending}
                submittingText="Signing in..."
              >
                Sign in
              </FormSubmitButton>
              <Button
                variant="outline"
                size="lg"
                className="h-12 w-full rounded-xl text-sm lg:h-8 lg:rounded-md lg:text-xs/relaxed"
                type="button"
                onClick={() => void handlePasskeySignIn()}
                disabled={form.state.isSubmitting || isPasskeyPending}
              >
                Use passkey
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground lg:hidden">
              New to RocketRota?{" "}
              <Link
                to="/sign-up"
                search={{ redirect: search.redirect }}
                className="font-medium text-foreground underline underline-offset-4"
              >
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
