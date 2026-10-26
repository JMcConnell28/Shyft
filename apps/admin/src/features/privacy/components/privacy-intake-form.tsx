import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { recordPrivacyRequestSchema } from "@rocketrota/shared/privacy"
import { usePrivacyIntake } from "../hooks/use-privacy-intake"
import { Button } from "@/components/ui/button"

function PrivacyIntakeForm() {
  const mutation = usePrivacyIntake()
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      userId: "",
      receivedAt: "",
      note: "",
      identityConfirmed: false,
    },
    onSubmit: ({ value }) => {
      const received = new Date(value.receivedAt)
      const parsed = recordPrivacyRequestSchema.safeParse({
        ...value,
        userId: value.userId || undefined,
        receivedAt: Number.isNaN(received.getTime())
          ? ""
          : received.toISOString(),
      })
      if (!parsed.success) {
        setError(
          parsed.error.issues[0]?.message ?? "Check the request details."
        )
        return
      }
      setError(null)
      mutation.mutate(parsed.data)
    },
  })
  return (
    <details className="rounded-lg border bg-white p-4">
      <summary className="font-medium">
        Record a request received by email or support
      </summary>
      <p className="my-3 text-sm text-slate-600">
        Keep the original received date. If identity is not yet verified, record
        the request in the support process immediately and verify it
        proportionately before linking an account or releasing information. An
        unlinked request can be fulfilled through an agreed secure external
        route.
      </p>
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          void form.handleSubmit()
        }}
      >
        {(["name", "email", "userId", "receivedAt"] as const).map((name) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <label className="block text-sm">
                {
                  {
                    name: "Requester name",
                    email: "Verified email",
                    userId: "Account user ID (optional)",
                    receivedAt: "Original received date and time",
                  }[name]
                }
                <input
                  required={name !== "userId"}
                  type={
                    name === "receivedAt"
                      ? "datetime-local"
                      : name === "email"
                        ? "email"
                        : "text"
                  }
                  className="mt-1 block w-full rounded-md border p-2"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </label>
            )}
          </form.Field>
        ))}
        <form.Field name="note">
          {(field) => (
            <label className="block text-sm">
              Source, scope and identity checks
              <textarea
                required
                minLength={10}
                maxLength={4000}
                className="mt-1 block w-full rounded-md border p-2"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </label>
          )}
        </form.Field>
        <form.Field name="identityConfirmed">
          {(field) => (
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(event) => field.handleChange(event.target.checked)}
              />
              <span>
                I have proportionately verified the requester and any account
                link.
              </span>
            </label>
          )}
        </form.Field>
        {(error || mutation.error) && (
          <p role="alert" className="text-sm text-red-700">
            {error ?? mutation.error?.message}
          </p>
        )}
        <Button disabled={mutation.isPending} type="submit">
          Record request
        </Button>
      </form>
    </details>
  )
}
export { PrivacyIntakeForm }
