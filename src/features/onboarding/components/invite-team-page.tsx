import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { CopyIcon, UserPlus2Icon } from "lucide-react"
import { EmailMemberInviteCard } from "./email-member-invite-card"
import { InviteLocationSelector } from "./invite-location-selector"

import type { ViewerState } from "@/features/onboarding/types"
import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { SelectFormField } from "@/components/forms/select-form-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { getErrorMessage } from "@/lib/errors"
import { createStaffInviteLink } from "@/lib/onboarding"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { staffInviteSelectionSchema } from "@/lib/onboarding-schemas"
import { createZodFieldValidator } from "@/lib/validation"

function InviteTeamPage({ viewer }: { viewer: ViewerState }) {
  const createStaffInviteLinkFn = useServerFn(createStaffInviteLink)
  const [error, setError] = React.useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null)
  const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle")

  const defaultStaffGroupId =
    viewer.staffGroups.find((group) => group.isFallback)?.id ??
    viewer.staffGroups.at(0)?.id ??
    ""

  const form = useForm({
    defaultValues: {
      organizationId: viewer.activeOrganizationId ?? "",
      locationIds: [] as Array<string>,
      defaultStaffGroupId,
    },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const result = await createStaffInviteLinkFn({
          data: staffInviteSelectionSchema.parse(value),
        })

        setInviteUrl(result.joinUrl)
      } catch (submissionError) {
        setError(
          getErrorMessage(
            submissionError,
            "We could not generate that invite link."
          )
        )
      }
    },
  })

  async function handleCopyInviteUrl() {
    if (!inviteUrl || typeof navigator === "undefined") {
      return
    }

    await navigator.clipboard.writeText(inviteUrl)
    setCopyState("copied")
    window.setTimeout(() => {
      setCopyState("idle")
    }, 1800)
  }

  return (
    <OnboardingShell
      badge="Team onboarding"
      eyebrow={
        viewer.activeWorkspace?.name ??
        viewer.activeOrganization?.name ??
        "Invite your team"
      }
      title="Generate the first invite link for your team."
      description="Choose the locations for this organization invite. Employees become active there after an owner or admin approves their request."
      progress={90}
      showSignOut
    >
      <div className="space-y-5">
        <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              <UserPlus2Icon className="size-3" />
              Staff invite link
            </Badge>
            <CardTitle className="mt-2 text-2xl">
              Create your invite link
            </CardTitle>
            <CardDescription>
              Generating a new onboarding link replaces the previous active
              staff invite for this organization.
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
                  name="locationIds"
                  listeners={{ onChange: () => setInviteUrl(null) }}
                >
                  {(field) => (
                    <InviteLocationSelector
                      locations={viewer.locations}
                      selectedIds={field.state.value}
                      onChange={field.handleChange}
                      disabled={form.state.isSubmitting}
                    />
                  )}
                </form.Field>

                <form.Field
                  name="defaultStaffGroupId"
                  listeners={{ onChange: () => setInviteUrl(null) }}
                  validators={{
                    onSubmit: createZodFieldValidator(
                      staffInviteSelectionSchema.shape.defaultStaffGroupId
                    ),
                  }}
                >
                  {(field) => (
                    <SelectFormField
                      field={field}
                      label="Staff group"
                      options={viewer.staffGroups.map((group) => ({
                        label: group.name,
                        value: group.id,
                      }))}
                      description="After approval, staff will use this group at each selected location."
                    />
                  )}
                </form.Field>
              </FieldGroup>

              <FormErrorMessage message={error} />

              <FormSubmitButton
                className="w-full sm:w-auto"
                isSubmitting={form.state.isSubmitting}
                submittingText="Generating invite..."
              >
                Generate invite link
              </FormSubmitButton>
            </form>
          </CardContent>
        </Card>

        {inviteUrl ? (
          <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-xl">Invite ready to share</CardTitle>
              <CardDescription>
                Send this to your staff so they can join directly from mobile or
                desktop.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                {inviteUrl}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => void handleCopyInviteUrl()}
                  className="w-full sm:w-auto"
                >
                  <CopyIcon />
                  {copyState === "copied" ? "Copied" : "Copy invite link"}
                </Button>
                <a
                  href={
                    viewer.activeOrganization
                      ? getOrganizationDashboardPath(
                          viewer.activeOrganization.slug
                        )
                      : "/dashboard"
                  }
                  className="inline-flex h-7 items-center justify-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-input/50 sm:w-auto"
                >
                  Finish setup
                </a>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {viewer.activeOrganization && <EmailMemberInviteCard />}
      </div>
    </OnboardingShell>
  )
}

export { InviteTeamPage }
