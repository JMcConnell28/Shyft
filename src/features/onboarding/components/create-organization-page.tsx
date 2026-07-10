import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Link2Icon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import {
  checkOrganizationSlugAvailability,
  createOrganizationWithBootstrap,
} from "@/lib/onboarding"
import {
  normalizeOrganizationSlug,
  organizationNameSchema,
  organizationSetupSchema,
  organizationSlugSchema,
} from "@/lib/onboarding-schemas"
import { createZodFieldValidator } from "@/lib/validation"

function CreateOrganizationPage() {
  const createOrganizationFn = useServerFn(createOrganizationWithBootstrap)
  const checkSlugFn = useServerFn(checkOrganizationSlugAvailability)
  const [error, setError] = React.useState<string | null>(null)
  const [isSlugEdited, setIsSlugEdited] = React.useState(false)
  const [slugStatus, setSlugStatus] = React.useState<
    "idle" | "checking" | "available" | "unavailable"
  >("idle")
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
        const result = await createOrganizationFn({
          data: organizationSetupSchema.parse({
            name: value.name,
            slug: normalizeOrganizationSlug(value.slug),
          }),
        })

        window.location.href = result.redirectTo
      } catch (submissionError) {
        setError(
          getErrorMessage(
            submissionError,
            "We could not create your organization."
          )
        )
      }
    },
  })

  React.useEffect(() => {
    if (!isSlugEdited) {
      const nextSlug = normalizeOrganizationSlug(organizationName)

      if (nextSlug !== organizationSlug) {
        form.setFieldValue("slug", nextSlug)
        setOrganizationSlug(nextSlug)
      }
    }
  }, [form, isSlugEdited, organizationName, organizationSlug])

  React.useEffect(() => {
    const slugResult = organizationSlugSchema.safeParse(organizationSlug)

    if (!organizationSlug || !slugResult.success) {
      setSlugStatus("idle")
      return
    }

    setSlugStatus("checking")
    const timeout = window.setTimeout(async () => {
      try {
        const result = await checkSlugFn({
          data: {
            slug: organizationSlug,
          },
        })
        setSlugStatus(result.available ? "available" : "unavailable")
      } catch {
        setSlugStatus("idle")
      }
    }, 350)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [checkSlugFn, organizationSlug])

  const slugPreview =
    typeof window === "undefined"
      ? `https://app.rocketrota.local/w/${organizationSlug || "your-team"}/dashboard`
      : `${window.location.origin}/w/${organizationSlug || "your-team"}/dashboard`

  return (
    <OnboardingShell
      badge="Organization setup"
      eyebrow="Step 2"
      title="Create your organisation."
      description="Use this when several workplaces need to sit under one business."
      progress={45}
      showSignOut
    >
      <form
        className="space-y-3 rounded-xl border border-border/70 bg-background p-3 shadow-sm sm:p-4"
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          void form.handleSubmit()
        }}
      >
        <FieldGroup className="gap-3">
          <form.Field
            name="name"
            validators={{
              onSubmit: createZodFieldValidator(organizationNameSchema),
            }}
          >
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Organisation name</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder="RocketRota Hospitality Group"
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
                <FieldLabel htmlFor={field.name}>Organisation slug</FieldLabel>
                <FieldContent>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    placeholder="rocketrota-group"
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      const nextValue = normalizeOrganizationSlug(
                        event.target.value
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

        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Link2Icon className="size-4" />
            URL preview
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {slugPreview}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {slugStatus === "checking"
              ? "Checking availability..."
              : slugStatus === "available"
                ? "This slug is available."
                : slugStatus === "unavailable"
                  ? "That slug is already taken."
                  : "Lowercase letters, numbers, and hyphens only."}
          </p>
        </div>

        <FormErrorMessage message={error} />

        <div className="flex flex-col gap-2 sm:flex-row">
          <FormSubmitButton
            className="w-full sm:w-auto"
            isSubmitting={form.state.isSubmitting}
            submittingText="Creating organization..."
          >
            Continue
          </FormSubmitButton>
          <Link
            to="/onboarding/setup"
            className="inline-flex h-9 items-center justify-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-input/50"
          >
            Back
          </Link>
        </div>
      </form>
    </OnboardingShell>
  )
}

export { CreateOrganizationPage }
