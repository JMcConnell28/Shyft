"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { Building2Icon, CreditCardIcon, Link2Icon } from "lucide-react"

import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ConnectionBillingChoice } from "@/features/settings/components/connection-billing-choice"
import { createOrganizationFromLocationInputSchema } from "@/features/settings/schemas/connection-settings-schemas"
import type {
  CreateOrganizationFromLocationResult,
  WorkspaceConnectionLocation,
} from "@/features/settings/types"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import {
  normalizeOrganizationSlug,
  organizationNameSchema,
  organizationSlugSchema,
} from "@/lib/onboarding-schemas"
import { createZodFieldValidator } from "@/lib/validation"

type BillingMode = "keep" | "organization"

type CreateOrganizationFromLocationCardProps = {
  isPending: boolean
  location: WorkspaceConnectionLocation
  onCreate: (input: {
    billingMode: BillingMode
    locationId: string
    name: string
    slug: string
  }) => Promise<CreateOrganizationFromLocationResult>
}

function CreateOrganizationFromLocationCard({
  isPending,
  location,
  onCreate,
}: CreateOrganizationFromLocationCardProps) {
  const navigate = useNavigate()
  const [billingMode, setBillingMode] = React.useState<BillingMode>("keep")
  const [error, setError] = React.useState<string | null>(null)
  const [isSlugEdited, setIsSlugEdited] = React.useState(false)
  const [organizationName, setOrganizationName] = React.useState("")
  const [organizationSlug, setOrganizationSlug] = React.useState("")

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const result = await onCreate(
          createOrganizationFromLocationInputSchema.parse({
            billingMode,
            locationId: location.id,
            name: value.name,
            slug: normalizeOrganizationSlug(value.slug),
          }),
        )

        await navigate({
          to: "/w/$workspaceSlug/settings/connections",
          params: {
            workspaceSlug: result.organizationSlug,
          },
        })
      } catch (submissionError) {
        setError(
          getErrorMessage(
            submissionError,
            "We could not create that organization.",
          ),
        )
      }
    },
  })

  React.useEffect(() => {
    if (isSlugEdited) {
      return
    }

    const nextSlug = normalizeOrganizationSlug(organizationName)

    if (nextSlug !== organizationSlug) {
      form.setFieldValue("slug", nextSlug)
      setOrganizationSlug(nextSlug)
    }
  }, [form, isSlugEdited, organizationName, organizationSlug])

  const slugPreview =
    typeof window === "undefined"
      ? `/w/${organizationSlug || "your-organization"}/settings/connections`
      : `${window.location.origin}/w/${
          organizationSlug || "your-organization"
        }/settings/connections`

  return (
    <Card className="border-border/70 bg-background/95 shadow-sm">
      <CardHeader className="gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm">Create an organization</CardTitle>
          <p className="text-xs leading-5 text-muted-foreground">
            Start with {location.name}, then add more locations when they are
            ready.
          </p>
        </div>
        <Badge variant="outline">From this location</Badge>
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
          <FieldGroup className="grid gap-3 md:grid-cols-2">
            <form.Field
              name="name"
              validators={{
                onSubmit: createZodFieldValidator(organizationNameSchema),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Organization name</FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Rocket Hospitality"
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextValue = event.target.value
                        setOrganizationName(nextValue)
                        field.handleChange(nextValue)
                      }}
                    />
                    <FieldError>{getFieldError(field)}</FieldError>
                  </FieldContent>
                </Field>
              )}
            </form.Field>

            <form.Field
              name="slug"
              validators={{
                onSubmit: createZodFieldValidator(organizationSlugSchema),
              }}
            >
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Workspace URL</FieldLabel>
                  <FieldContent>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="rocket-hospitality"
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextValue = normalizeOrganizationSlug(
                          event.target.value,
                        )
                        setIsSlugEdited(true)
                        setOrganizationSlug(nextValue)
                        field.handleChange(nextValue)
                      }}
                    />
                    <FieldError>{getFieldError(field)}</FieldError>
                  </FieldContent>
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Link2Icon className="size-4 text-muted-foreground" />
              URL preview
            </div>
            <p className="break-all text-xs leading-5 text-muted-foreground">
              {slugPreview}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <CreditCardIcon className="size-4 text-muted-foreground" />
              Billing
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ConnectionBillingChoice
                checked={billingMode === "keep"}
                label="Keep location billing"
                description={`${location.name} keeps its current billing account.`}
                onClick={() => setBillingMode("keep")}
              />
              <ConnectionBillingChoice
                checked={billingMode === "organization"}
                label="Create organization billing"
                description="Move this location onto shared billing. Payment setup stays in Billing."
                onClick={() => setBillingMode("organization")}
              />
            </div>
          </div>

          <FormErrorMessage message={error} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <FieldDescription className="flex items-center gap-2 text-xs">
              <Building2Icon className="size-3.5" />
              The location remains usable during the move.
            </FieldDescription>
            <FormSubmitButton
              className="w-full sm:w-auto"
              isSubmitting={form.state.isSubmitting || isPending}
              submittingText="Creating organization..."
            >
              Create and connect
            </FormSubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export { CreateOrganizationFromLocationCard }
