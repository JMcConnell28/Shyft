import { useForm } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { ArrowRightIcon, Building2Icon } from "lucide-react"
import { useState } from "react"

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
import { SetupArtworkShell } from "@/features/onboarding/components/setup-artwork-shell"
import { StepIntro } from "@/features/onboarding/components/setup-step-intro"
import { SetupStepper } from "@/features/onboarding/components/setup-stepper"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import { createOrganizationWithBootstrap } from "@/lib/onboarding"
import {
  onboardingOrganizationSchema,
  organizationNameSchema,
} from "@/lib/onboarding-schemas"
import { createZodFieldValidator } from "@/lib/validation"

function CreateOrganizationPage() {
  const createOrganizationFn = useServerFn(createOrganizationWithBootstrap)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const result = await createOrganizationFn({
          data: onboardingOrganizationSchema.parse(value),
        })
        window.location.href = result.redirectTo
      } catch (submissionError) {
        setError(
          getErrorMessage(
            submissionError,
            "We could not create your organisation."
          )
        )
      }
    },
  })

  return (
    <SetupArtworkShell>
      <SetupStepper activeIndex={0} labels={["Organisation", "Workspace"]} />
      <StepIntro
        title="Create your organisation"
        description="Name your organisation to start setting up your rota and team."
      />
      <form
        className="mx-auto max-w-[540px] space-y-4"
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
                <FieldLabel
                  htmlFor={field.name}
                  className="text-sm font-semibold text-[#24395f]"
                >
                  Organisation name
                </FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Building2Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-[#657b9e]" />
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="e.g. Joe’s Coffee Shop"
                      autoFocus
                      className="h-11 rounded-xl border-[#cbd9f1] pl-11 text-sm shadow-none focus-visible:border-[#1264e9]"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    />
                  </div>
                  <FieldError>{getFieldError(field)}</FieldError>
                </FieldContent>
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        <FormErrorMessage message={error} />

        <div className="space-y-2 text-center">
          <FormSubmitButton
            className="h-11 w-full rounded-xl bg-[#1264e9] text-sm font-semibold shadow-[0_10px_24px_rgba(18,100,233,0.16)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#0757d7] hover:shadow-[0_14px_28px_rgba(18,100,233,0.2)] motion-reduce:transform-none"
            isSubmitting={form.state.isSubmitting}
            submittingText="Creating organisation..."
          >
            Continue <ArrowRightIcon className="ml-2 size-4" />
          </FormSubmitButton>
          <Link
            to="/"
            className="inline-flex min-h-9 items-center justify-center text-sm font-semibold text-[#075fe6] underline underline-offset-4 hover:text-[#064cb8]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </SetupArtworkShell>
  )
}

export { CreateOrganizationPage }
