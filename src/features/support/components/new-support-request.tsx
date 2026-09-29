import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSupportLocations } from "@/features/support/hooks/use-support-locations"
import { useSupportMutations } from "@/features/support/hooks/use-support-mutations"
import { createSupportThreadSchema } from "@/features/support/schemas"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import { createZodFieldValidator } from "@/lib/validation"

function NewSupportRequest({
  organizationId,
  workspaceSlug,
}: {
  organizationId: string
  workspaceSlug: string
}) {
  const navigate = useNavigate()
  const { createMutation } = useSupportMutations(organizationId)
  const locations = useSupportLocations(organizationId)
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      category: "support" as "support" | "bug" | "feature_request",
      locationId: null as string | null,
      subject: "",
      body: "",
    },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const data = createSupportThreadSchema.parse({
          ...value,
          organizationId,
        })
        const result = await createMutation.mutateAsync(data)
        form.reset()
        await navigate({
          to: "/app/$workspaceSlug/support/$threadId",
          params: { workspaceSlug, threadId: result.id },
        })
      } catch (submissionError) {
        setError(
          getErrorMessage(submissionError, "We could not send your request.")
        )
      }
    },
  })

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field name="category">
        {(field) => (
          <div className="space-y-1.5">
            <label htmlFor="support-category" className="text-sm font-medium">
              What can we help with?
            </label>
            <select
              id="support-category"
              className="h-10 w-full rounded-lg border border-[#dfe5f0] bg-white px-3 text-sm text-[#10204b]"
              value={field.state.value}
              onChange={(event) =>
                field.handleChange(
                  createSupportThreadSchema.shape.category.parse(
                    event.target.value
                  )
                )
              }
            >
              <option value="support">Question</option>
              <option value="bug">Issue</option>
              <option value="feature_request">Suggestion</option>
            </select>
          </div>
        )}
      </form.Field>
      <form.Field name="locationId">
        {(field) => (
          <div className="space-y-1.5">
            <label htmlFor="support-location" className="text-sm font-medium">
              Location
            </label>
            <select
              id="support-location"
              className="h-10 w-full rounded-lg border border-[#dfe5f0] bg-white px-3 text-sm text-[#10204b]"
              value={field.state.value ?? ""}
              onChange={(event) =>
                field.handleChange(
                  createSupportThreadSchema.shape.locationId.parse(
                    event.target.value || null
                  )
                )
              }
            >
              <option value="">All locations / general question</option>
              {(locations.data ?? []).map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
            {locations.isPending ? (
              <p className="text-xs text-[#61709a]">Loading locations…</p>
            ) : null}
            {locations.isError ? (
              <p className="text-xs text-[#61709a]">
                Locations are unavailable. You can still send a general request.
              </p>
            ) : null}
          </div>
        )}
      </form.Field>
      <form.Field
        name="subject"
        validators={{
          onSubmit: createZodFieldValidator(
            createSupportThreadSchema.shape.subject
          ),
        }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <label htmlFor="support-subject" className="text-sm font-medium">
              Subject
            </label>
            <Input
              id="support-subject"
              className="h-10 rounded-lg border-[#dfe5f0] bg-white text-[#10204b]"
              maxLength={160}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="A short summary"
            />
            {getFieldError(field) ? (
              <p className="text-sm text-destructive">{getFieldError(field)}</p>
            ) : null}
          </div>
        )}
      </form.Field>
      <form.Field
        name="body"
        validators={{
          onSubmit: createZodFieldValidator(
            createSupportThreadSchema.shape.body
          ),
        }}
      >
        {(field) => (
          <div className="space-y-1.5">
            <label htmlFor="support-body" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="support-body"
              className="rounded-lg border-[#dfe5f0] bg-white text-[#10204b]"
              maxLength={5000}
              rows={6}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              placeholder="Tell us what happened or what you would like to see."
            />
            {getFieldError(field) ? (
              <p className="text-sm text-destructive">{getFieldError(field)}</p>
            ) : null}
          </div>
        )}
      </form.Field>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        className="h-10 justify-self-end rounded-lg bg-[#0867f2] px-4 font-semibold text-white hover:bg-[#075edc]"
        disabled={form.state.isSubmitting || createMutation.isPending}
      >
        {createMutation.isPending ? "Sending…" : "Send request"}
      </Button>
    </form>
  )
}

export { NewSupportRequest }
