import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { updatePrivacyRequestSchema } from "@rocketrota/shared/privacy"
import type { UpdatePrivacyRequestInput } from "@rocketrota/shared/privacy"
import { Button } from "@/components/ui/button"

function PrivacyStatusForm({
  id,
  revision,
  onSave,
  pending,
}: {
  id: string
  revision: number
  pending: boolean
  onSave: (input: Omit<UpdatePrivacyRequestInput, "id" | "revision">) => void
}) {
  const [validationError, setValidationError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      status: "in_review",
      message: "",
      internalNote: "",
      extendedDueAt: "",
      extensionReason: "",
    },
    onSubmit: ({ value }) => {
      const input = updatePrivacyRequestSchema.safeParse({
        ...value,
        id,
        revision,
        extendedDueAt: value.extendedDueAt
          ? new Date(`${value.extendedDueAt}T23:59:59Z`).toISOString()
          : undefined,
        extensionReason: value.extensionReason || undefined,
      })
      if (!input.success) {
        setValidationError(
          input.error.issues[0]?.message ?? "Check the request update."
        )
        return
      }
      setValidationError(null)
      onSave(input.data)
    },
  })
  return (
    <form
      className="space-y-3 rounded-lg border bg-white p-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <h2 className="font-semibold">Update the requester</h2>
      <form.Field name="status">
        {(field) => (
          <label className="block text-sm">
            Progress
            <select
              className="mt-1 block w-full rounded-md border p-2"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            >
              <option value="in_review">Being reviewed</option>
              <option value="awaiting_workplace">Workplace follow-up</option>
              <option value="completed">
                Concluded / delivered through another secure route
              </option>
            </select>
          </label>
        )}
      </form.Field>
      <form.Field name="message">
        {(field) => (
          <label className="block text-sm">
            Message visible to the requester
            <textarea
              required
              minLength={5}
              maxLength={2000}
              className="mt-1 block w-full rounded-md border p-2"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </label>
        )}
      </form.Field>
      <form.Field name="internalNote">
        {(field) => (
          <label className="block text-sm">
            Internal coordination / delivery record
            <textarea
              maxLength={4000}
              className="mt-1 block w-full rounded-md border p-2"
              value={field.state.value}
              onChange={(event) => field.handleChange(event.target.value)}
            />
          </label>
        )}
      </form.Field>
      <details>
        <summary className="text-sm">Lawful deadline extension</summary>
        <p className="my-2 text-sm text-slate-600">
          Only when justified by complexity or multiple requests. Notify within
          the original deadline. Workplace follow-up does not automatically
          extend it.
        </p>
        <form.Field name="extendedDueAt">
          {(field) => (
            <label className="block text-sm">
              New response date
              <input
                className="mt-1 block w-full rounded-md border p-2"
                type="date"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="extensionReason">
          {(field) => (
            <label className="mt-2 block text-sm">
              Explanation for the requester
              <textarea
                className="mt-1 block w-full rounded-md border p-2"
                minLength={10}
                maxLength={2000}
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>
      </details>
      {validationError && (
        <p role="alert" className="text-sm text-red-700">
          {validationError}
        </p>
      )}
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : "Save update"}
      </Button>
    </form>
  )
}
export { PrivacyStatusForm }
