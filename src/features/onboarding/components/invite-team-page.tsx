import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { CopyIcon, UserPlus2Icon } from "lucide-react"

import type { ViewerState } from "@/features/onboarding/types"
import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { SelectFormField } from "@/components/forms/select-form-field"
import { TextFormField } from "@/components/forms/text-form-field"
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
import {
  createStaffInviteLink,
  inviteOrganizationMemberByEmail,
} from "@/lib/onboarding"
import { getOrganizationDashboardPath } from "@/lib/organization-paths"
import { getLocationDashboardPath } from "@/lib/organization-paths"
import {
  emailSchema,
  organizationMemberInviteSchema,
  staffInviteSelectionSchema,
} from "@/lib/onboarding-schemas"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"


function InviteTeamPage({ viewer }: { viewer: ViewerState }) {
  const createStaffInviteLinkFn = useServerFn(createStaffInviteLink)
  const inviteOrganizationMemberByEmailFn = useServerFn(
    inviteOrganizationMemberByEmail,
  )
  const [error, setError] = React.useState<string | null>(null)
  const [inviteUrl, setInviteUrl] = React.useState<string | null>(null)
  const [copyState, setCopyState] = React.useState<"idle" | "copied">("idle")
  const [memberInviteError, setMemberInviteError] = React.useState<string | null>(
    null,
  )

  const defaultLocationId = viewer.locations.at(0)?.id ?? ""
  const defaultStaffGroupId =
    viewer.staffGroups.find((group) => group.isFallback)?.id ??
    viewer.staffGroups.at(0)?.id ??
    ""

  const form = useForm({
    defaultValues: {
      locationId: defaultLocationId,
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
        setError(getErrorMessage(submissionError, "We could not generate that invite link."))
      }
    },
  })

  const memberInviteForm = useForm({
    defaultValues: {
      email: "",
      role: "manager" as AssignableOrganizationRole,
    },
    onSubmit: async ({ value }) => {
      setMemberInviteError(null)

      try {
        await inviteOrganizationMemberByEmailFn({
          data: organizationMemberInviteSchema.parse(value),
        })

        showSuccessToast(`Invitation sent to ${value.email}.`)
        memberInviteForm.reset()
      } catch (submissionError) {
        setMemberInviteError(
          getErrorMessage(submissionError, "We could not send that invitation."),
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
      eyebrow={viewer.activeWorkspace?.name ?? viewer.activeOrganization?.name ?? "Invite your team"}
      title="Generate the first invite link for your team."
      description="This reusable staff link is the fastest way to get employees into the right workplace, location, and rota group."
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
            <CardTitle className="mt-2 text-2xl">Create your invite link</CardTitle>
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
                  name="locationId"
                  validators={{
                    onSubmit: createZodFieldValidator(
                      staffInviteSelectionSchema.shape.locationId,
                    ),
                  }}
                >
                  {(field) => (
                    <SelectFormField
                      field={field}
                      label="Location"
                      options={viewer.locations.map((location) => ({
                        label: location.name,
                        value: location.id,
                      }))}
                    />
                  )}
                </form.Field>

                <form.Field
                  name="defaultStaffGroupId"
                  validators={{
                    onSubmit: createZodFieldValidator(
                      staffInviteSelectionSchema.shape.defaultStaffGroupId,
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
                      description="Staff joining from this link will be placed into this rota group."
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
                  viewer.activeWorkspace?.type === "location"
                    ? getLocationDashboardPath(viewer.activeWorkspace.slug)
                    : viewer.activeOrganization
                      ? getOrganizationDashboardPath(viewer.activeOrganization.slug)
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

        {viewer.activeOrganization ? (
        <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-xl">Invite a manager or admin by email</CardTitle>
            <CardDescription>
              Use Better Auth email invitations when someone should join by
              email rather than through the reusable staff link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-5"
              onSubmit={(event) => {
                event.preventDefault()
                event.stopPropagation()
                void memberInviteForm.handleSubmit()
              }}
            >
              <FieldGroup>
                <memberInviteForm.Field
                  name="email"
                  validators={{
                    onSubmit: createZodFieldValidator(emailSchema),
                  }}
                >
                  {(field) => (
                    <TextFormField
                      field={field}
                      label="Invite email"
                      type="email"
                      placeholder="manager@venue.com"
                    />
                  )}
                </memberInviteForm.Field>

                <memberInviteForm.Field
                  name="role"
                  validators={{
                    onSubmit: createZodFieldValidator(
                      organizationMemberInviteSchema.shape.role,
                    ),
                  }}
                >
                  {(field) => (
                    <SelectFormField
                      field={field}
                      label="Organization role"
                      options={[
                        { label: "Admin", value: "admin" },
                        { label: "Manager", value: "manager" },
                        { label: "Supervisor", value: "supervisor" },
                        { label: "Employee", value: "employee" },
                      ]}
                      description="Managers can build rotas. Supervisors can oversee rotas, timesheets, and attendance without editing schedules."
                    />
                  )}
                </memberInviteForm.Field>
              </FieldGroup>

              <FormErrorMessage message={memberInviteError} />

              <FormSubmitButton
                className="w-full sm:w-auto"
                isSubmitting={memberInviteForm.state.isSubmitting}
                submittingText="Sending invite..."
              >
                Send email invite
              </FormSubmitButton>
            </form>
          </CardContent>
        </Card>
        ) : null}
      </div>
    </OnboardingShell>
  )
}

export { InviteTeamPage }
