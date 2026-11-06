import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import type { AssignableOrganizationRole } from "@/lib/auth/permissions"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { SelectFormField } from "@/components/forms/select-form-field"
import { TextFormField } from "@/components/forms/text-form-field"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { getErrorMessage } from "@/lib/errors"
import { inviteOrganizationMemberByEmail } from "@/lib/onboarding"
import {
  emailSchema,
  organizationMemberInviteSchema,
} from "@/lib/onboarding-schemas"
import { showSuccessToast } from "@/lib/toast"
import { createZodFieldValidator } from "@/lib/validation"

function EmailMemberInviteCard() {
  const inviteOrganizationMemberByEmailFn = useServerFn(
    inviteOrganizationMemberByEmail
  )
  const [memberInviteError, setMemberInviteError] = useState<string | null>(
    null
  )
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
          getErrorMessage(submissionError, "We could not send that invitation.")
        )
      }
    },
  })

  return (
    <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-xl">
          Invite a manager or admin by email
        </CardTitle>
        <CardDescription>
          Use Better Auth email invitations when someone should join by email
          rather than through the reusable staff link.
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
                  organizationMemberInviteSchema.shape.role
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
                  description="Managers can build rotas. Supervisors can make manual clock-ins and clock-outs but cannot view other employees’ timesheets."
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
  )
}
export { EmailMemberInviteCard }
