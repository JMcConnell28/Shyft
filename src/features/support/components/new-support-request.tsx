import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      category: "support" as "support" | "bug" | "feature_request",
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
      className="space-y-4 rounded-xl border bg-background p-5"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <h2 className="text-lg font-semibold">Send a request</h2>
      <form.Field name="category">
        {(field) => (
          <div className="space-y-1.5">
            <label htmlFor="support-category" className="text-sm font-medium">
              What can we help with?
            </label>
            <select
              id="support-category"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
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
        disabled={form.state.isSubmitting || createMutation.isPending}
      >
        {createMutation.isPending ? "Sending…" : "Send request"}
      </Button>
    </form>
  )
}

export { NewSupportRequest }
