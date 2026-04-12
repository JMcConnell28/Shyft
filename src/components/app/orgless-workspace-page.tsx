import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import {
  Building2Icon,
  CirclePlusIcon,
  KeyRoundIcon,
  MoveRightIcon,
} from "lucide-react"

import type { OrganizationSummary } from "@/features/onboarding/types"
import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { getErrorMessage } from "@/lib/errors"
import { activateOrganization } from "@/lib/onboarding"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { extractInviteDestination, inviteLinkSchema } from "@/lib/onboarding-schemas"
import { cn } from "@/lib/utils"
import { createZodFieldValidator } from "@/lib/validation"

type OrglessWorkspacePageProps = {
  organizations: Array<OrganizationSummary>
}

function OrglessWorkspacePage({ organizations }: OrglessWorkspacePageProps) {
  const activateOrganizationFn = useServerFn(activateOrganization)
  const [error, setError] = React.useState<string | null>(null)
  const [isSwitchingOrganization, setIsSwitchingOrganization] = React.useState<
    string | null
  >(null)

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

  async function handleActivateOrganization(organizationId: string) {
    setError(null)
    setIsSwitchingOrganization(organizationId)

    try {
      await activateOrganizationFn({
        data: {
          organizationId,
        },
      })
      const organization =
        organizations.find((entry) => entry.id === organizationId) ?? null
      window.location.href = organization
        ? getOrganizationDashboardPath(organization.slug)
        : "/dashboard"
    } catch (activationError) {
      setError(getErrorMessage(activationError, "We could not open that workspace."))
      setIsSwitchingOrganization(null)
    }
  }

  return (
    <OnboardingShell
      badge="Workspace setup"
      eyebrow="No active organization"
      title="Choose how you want to start using Shyft."
      description="Create a new organization for your team, or join an existing workplace with an invite. This screen is your clean starting point after account verification."
      progress={20}
    >
      <div className="space-y-5">
        <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <Badge variant="outline" className="w-fit">
              <CirclePlusIcon className="size-3" />
              Create organization
            </Badge>
            <CardTitle className="text-2xl">
              Start a new workplace for your team
            </CardTitle>
            <CardDescription>
              Create the organization, add your first location, and generate a
              team invite in a few focused steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/onboarding/org"
              className={cn(buttonVariants(), "w-full sm:w-auto")}
            >
              Create organization
              <MoveRightIcon />
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
          <CardHeader className="space-y-3">
            <Badge variant="outline" className="w-fit">
              <KeyRoundIcon className="size-3" />
              Join with invite
            </Badge>
            <CardTitle className="text-2xl">Open an invite from your manager</CardTitle>
            <CardDescription>
              Paste a Shyft invite link or token to join your workplace. Staff
              and manager invites both work here.
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
                      label="Invite link"
                      placeholder="Paste the invite link or token"
                      description="Ask your manager for a Shyft invite if you do not have one yet."
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

        {organizations.length ? (
          <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit">
                <Building2Icon className="size-3" />
                Your workspaces
              </Badge>
              <CardTitle className="text-2xl">Pick an existing organization</CardTitle>
              <CardDescription>
                You already belong to one or more organizations. Choose one to
                make it your active workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {organizations.map((organization) => (
                <div
                  key={organization.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-foreground">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {organization.slug}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    disabled={isSwitchingOrganization === organization.id}
                    onClick={() => {
                      void handleActivateOrganization(organization.id)
                    }}
                  >
                    {isSwitchingOrganization === organization.id
                      ? "Opening..."
                      : "Open workspace"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </OnboardingShell>
  )
}

export { OrglessWorkspacePage }
