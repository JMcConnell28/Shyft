import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { KeyRoundIcon, MapPinPlusIcon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import {
  extractInviteDestination,
  inviteLinkSchema,
} from "@/lib/onboarding-schemas"
import { cn } from "@/lib/utils"
import { createZodFieldValidator } from "@/lib/validation"

function JoinWorkplacePage() {
  const [error, setError] = React.useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      invite: "",
    },
    onSubmit: ({ value }) => {
      setError(null)
      const destination = extractInviteDestination(value.invite)

      if (!destination) {
        setError("Paste a valid invite link or token.")
        return
      }

      window.location.href = destination.to
    },
  })

  return (
    <OnboardingShell
      badge="Join workplace"
      eyebrow="Team member setup"
      title="Join your workplace with an invite."
      description="Create your account first, then use the invite from your manager to join the right location and staff group."
      progress={35}
      showBackToDashboard={false}
      showSignOut
    >
      <div className="space-y-4">
        <Card className="border-border/70 bg-background shadow-sm">
          <CardHeader className="space-y-3">
            <Badge variant="outline" className="w-fit">
              <KeyRoundIcon className="size-3" />
              Invite link
            </Badge>
            <CardTitle className="text-2xl">Paste your invite</CardTitle>
            <CardDescription>
              Staff and manager invite links both work here.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                  name="invite"
                  validators={{
                    onSubmit: createZodFieldValidator(inviteLinkSchema),
                  }}
                >
                  {(field) => (
                    <TextFormField
                      field={field}
                      label="Invite link or token"
                      placeholder="Paste the invite link from your manager"
                      description="You can come back later if you do not have an invite yet."
                    />
                  )}
                </form.Field>
              </FieldGroup>

              <FormErrorMessage message={error} />

              <FormSubmitButton
                className="w-full sm:w-auto"
                isSubmitting={form.state.isSubmitting}
                submittingText="Opening invite..."
              >
                Continue with invite
              </FormSubmitButton>
            </form>
          </CardContent>
        </Card>

        <Link
          to="/onboarding/setup"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start gap-2 sm:w-auto",
          )}
        >
          <MapPinPlusIcon className="size-4" />
          I need to set up a workplace instead
        </Link>
      </div>
    </OnboardingShell>
  )
}

export { JoinWorkplacePage }
