import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { Building2Icon, Link2Icon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
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
        setError(getErrorMessage(submissionError, "We could not create your organization."))
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
      ? `https://app.shyft.local/o/${organizationSlug || "your-team"}/dashboard`
      : `${window.location.origin}/o/${organizationSlug || "your-team"}/dashboard`

  return (
    <OnboardingShell
      badge="Organization setup"
      eyebrow="Create organization"
      title="Give your team a workspace they can recognize."
      description="Pick the organization name your managers and staff will see every day, then lock in a clean slug for future workspace URLs."
      progress={35}
    >
      <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <Building2Icon className="size-3" />
            Organization details
          </Badge>
          <CardTitle className="mt-2 text-2xl">Create your organization</CardTitle>
          <CardDescription>
            Your free trial starts as soon as this organization is created.
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
                        placeholder="Shyft Hospitality Group"
                        onBlur={field.handleBlur}
                        onChange={(event) => {
                          const nextValue = event.target.value
                          setOrganizationName(nextValue)
                          field.handleChange(nextValue)
                        }}
                      />
                      <FieldDescription>
                        Managers and staff will see this across onboarding,
                        invites, and rota views.
                      </FieldDescription>
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
                    <FieldLabel htmlFor={field.name}>Organization slug</FieldLabel>
                    <FieldContent>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        placeholder="shyft-group"
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
                      <FieldDescription>
                        Lowercase letters, numbers, and hyphens only.
                      </FieldDescription>
                      <FieldError>{getFieldError(field)}</FieldError>
                    </FieldContent>
                  </Field>
                )}
              </form.Field>
            </FieldGroup>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Link2Icon className="size-4" />
                URL preview
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{slugPreview}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {slugStatus === "checking"
                  ? "Checking availability..."
                  : slugStatus === "available"
                    ? "This slug is available."
                    : slugStatus === "unavailable"
                      ? "That slug is already taken."
                      : "The final URL pattern will use this slug as your workspace identifier."}
              </p>
            </div>

            <FormErrorMessage message={error} />

            <div className="flex flex-col gap-3 sm:flex-row">
              <FormSubmitButton
                className="w-full sm:w-auto"
                isSubmitting={form.state.isSubmitting}
                submittingText="Creating organization..."
              >
                Continue to location setup
              </FormSubmitButton>
              <a
                href="/dashboard"
                className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-medium transition-colors hover:bg-input/50"
              >
                Cancel
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </OnboardingShell>
  )
}

export { CreateOrganizationPage }
