import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Link, createFileRoute, redirect } from "@tanstack/react-router"
import { KeyRoundIcon } from "lucide-react"

import {
  SetupAuthShell,
  setupAuthPrimaryButtonClassName,
  setupAuthSecondaryButtonClassName,
} from "@/components/app/setup-auth-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { authClient } from "@/lib/auth-client"
import { getSession } from "@/lib/auth-server"
import { createZodFieldValidator } from "@/lib/validation"
import { emailSchema, passwordSchema } from "@/lib/onboarding-schemas"
import { Button } from "@/components/ui/button"
import { FieldGroup } from "@/components/ui/field"
import { invalidateNavigationCache } from "@/features/navigation/invalidate-navigation-cache"

export const Route = createFileRoute("/login")({
  validateSearch: (search) => ({
    redirect:
      typeof search.redirect === "string" && search.redirect.length > 0
        ? search.redirect
        : "/dashboard",
  }),
  beforeLoad: async ({ context }) => {
    await invalidateNavigationCache(context.queryClient)
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
    <SetupAuthShell
      title="Welcome back"
      description="Sign in to manage your rota and team."
      alternateLabel="Need an account?"
      alternateAction="Create one"
      alternateHref="/sign-up"
      alternateRedirect={search.redirect}
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-3">
          <form.Field
            name="email"
            validators={{
              onSubmit: createZodFieldValidator(emailSchema),
            }}
          >
            {(field) => (
              <TextFormField
                field={field}
                label="Email"
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
                required
              />
            )}
          </form.Field>
        </FieldGroup>

        <FormErrorMessage message={error} />

        <div className="space-y-2">
          <div className="flex justify-end">
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 text-xs font-semibold text-[#075fe6]"
              nativeButton={false}
              render={<Link to="/forgot-password" />}
            >
              Forgot password?
            </Button>
          </div>
          <FormSubmitButton
            className={setupAuthPrimaryButtonClassName}
            isSubmitting={form.state.isSubmitting || isPasskeyPending}
            submittingText="Signing in..."
          >
            Sign in
          </FormSubmitButton>
          <Button
            variant="outline"
            size="lg"
            className={setupAuthSecondaryButtonClassName}
            type="button"
            onClick={() => void handlePasskeySignIn()}
            disabled={form.state.isSubmitting || isPasskeyPending}
          >
            <KeyRoundIcon />
            Use passkey
          </Button>
        </div>
      </form>
    </SetupAuthShell>
  )
}
