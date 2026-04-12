import * as React from "react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, getRouteApi, redirect } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { MapPinnedIcon } from "lucide-react"

import { OnboardingShell } from "@/components/app/onboarding-shell"
import { FormErrorMessage } from "@/components/forms/form-error-message"
import { FormSubmitButton } from "@/components/forms/form-submit-button"
import { TextFormField } from "@/components/forms/text-form-field"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import {
  getExistingOrganizationRedirect,
  getPendingOnboardingPath,
} from "@/features/onboarding/utils/viewer-route-redirects"
import { getErrorMessage } from "@/lib/errors"
import { createFirstLocationAndZone } from "@/lib/onboarding"
import {
  locationNameSchema,
  normalizeZoneName,
  zoneNameSchema,
} from "@/lib/onboarding-schemas"
import { createZodFieldValidator } from "@/lib/validation"

const verifiedRouteApi = getRouteApi("/_authed/_verified")

export const Route = createFileRoute("/_authed/_verified/onboarding/location")({
  beforeLoad: ({ context }) => {
    const viewer = context.viewer

    if (!viewer.activeOrganization) {
      throw redirect({ to: "/dashboard" })
    }

    if (viewer.onboarding?.hasLocation) {
      const redirectTarget =
        getPendingOnboardingPath(viewer) ?? getExistingOrganizationRedirect(viewer)

      if (redirectTarget) {
        throw redirect({ href: redirectTarget })
      }
    }
  },
  head: () => ({
    meta: [
      { title: "Create First Location | Shyft" },
      {
        name: "description",
        content: "Create the first location and default zone for your organization.",
      },
    ],
  }),
  component: CreateLocationRoute,
})

function CreateLocationRoute() {
  const { viewer } = verifiedRouteApi.useRouteContext()
  const createFirstLocationFn = useServerFn(createFirstLocationAndZone)
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      locationName: "",
      zoneName: "Zone 1",
    },
    onSubmit: async ({ value }) => {
      setError(null)

      try {
        const result = await createFirstLocationFn({
          data: {
            locationName: value.locationName,
            zoneName: normalizeZoneName(value.zoneName),
          },
        })

        window.location.href = result.redirectTo
      } catch (submissionError) {
        setError(getErrorMessage(submissionError, "We could not save that location."))
      }
    },
  })

  return (
    <OnboardingShell
      badge="Location setup"
      eyebrow={viewer.activeOrganization?.name ?? "First location"}
      title="Create the first location your team will rota against."
      description="This should be the main venue or workplace your managers need to schedule first. You can add more locations later."
      progress={65}
    >
      <Card className="rounded-3xl border-border/60 bg-background/90 shadow-2xl shadow-slate-950/10 backdrop-blur">
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            <MapPinnedIcon className="size-3" />
            First location
          </Badge>
          <CardTitle className="mt-2 text-2xl">Set up your first location</CardTitle>
          <CardDescription>
            We will also create your first zone here so your team can start
            working with rotas immediately.
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
                name="locationName"
                validators={{
                  onSubmit: createZodFieldValidator(locationNameSchema),
                }}
              >
                {(field) => (
                  <TextFormField
                    field={field}
                    label="Location name"
                    placeholder="Front Street Bar"
                    description="This is the venue or workplace your first rota will belong to."
                  />
                )}
              </form.Field>

              <form.Field
                name="zoneName"
                validators={{
                  onSubmit: createZodFieldValidator(zoneNameSchema),
                }}
              >
                {(field) => (
                  <TextFormField
                    field={field}
                    label="First zone"
                    placeholder="Zone 1"
                    description="Leave this as Zone 1 or rename it to something like Front Bar."
                  />
                )}
              </form.Field>
            </FieldGroup>

            <FormErrorMessage message={error} />

            <FormSubmitButton
              className="w-full sm:w-auto"
              isSubmitting={form.state.isSubmitting}
              submittingText="Saving location..."
            >
              Continue to team invite
            </FormSubmitButton>
          </form>
        </CardContent>
      </Card>
    </OnboardingShell>
  )
}
