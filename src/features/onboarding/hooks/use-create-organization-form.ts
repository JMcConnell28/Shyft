import { useForm } from "@tanstack/react-form"
import { useServerFn } from "@tanstack/react-start"
import { useState } from "react"

import { toAppError } from "@/lib/errors"
import { createOrganizationWithBootstrap } from "@/lib/onboarding"
import { onboardingOrganizationSchema } from "@/lib/onboarding-schemas"

function useCreateOrganizationForm() {
  const createOrganization = useServerFn(createOrganizationWithBootstrap)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: { name: "" },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const result = await createOrganization({
          data: onboardingOrganizationSchema.parse(value),
        })
        window.location.href = result.redirectTo
      } catch (submissionError) {
        const appError = toAppError(submissionError)
        setError(
          appError.kind === "auth"
            ? appError.message
            : "We couldn’t finish setting up your organisation. Refresh the page to try again. If the problem continues, contact support."
        )
      }
    },
  })

  return { form, error }
}

export { useCreateOrganizationForm }
