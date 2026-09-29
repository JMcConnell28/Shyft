import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { getSupportCategoryLabel } from "@/features/support/constants"
import { useSupportDetail } from "@/features/support/hooks/use-support-detail"
import { useSupportMutations } from "@/features/support/hooks/use-support-mutations"
import { supportQueryKeys } from "@/features/support/query-keys"
import { replyToSupportThreadSchema } from "@/features/support/schemas"

function SupportThreadPage({ id }: { id: string }) {
  const queryClient = useQueryClient()
  const query = useSupportDetail(id)
  const { replyMutation, updateStatusMutation } = useSupportMutations()
  const [error, setError] = useState<string | null>(null)
  const lastMessageId = query.data?.messages.at(-1)?.id

  useEffect(() => {
    if (lastMessageId) {
      void queryClient.invalidateQueries({
        queryKey: supportQueryKeys.lists,
      })
      void queryClient.invalidateQueries({
        queryKey: supportQueryKeys.unread,
      })
    }
  }, [lastMessageId, queryClient])

  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const data = replyToSupportThreadSchema.parse({ id, ...value })
        await replyMutation.mutateAsync(data)
        form.reset()
      } catch {
        setError("We could not send your reply.")
      }
    },
  })

  async function resolve() {
    setError(null)
    try {
      await updateStatusMutation.mutateAsync(id)
    } catch {
      setError("We could not resolve this request.")
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to="/support"
        className="text-sm font-medium text-blue-700 hover:underline"
      >
        ← Support inbox
      </Link>
      {query.isPending ? (
        <p className="text-sm text-slate-500">Loading conversation…</p>
      ) : null}
      {query.isError ? (
        <p role="alert" className="text-sm text-red-700">
          We could not load this conversation.
        </p>
      ) : null}
      {query.data ? (
        <>
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{query.data.subject}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {query.data.customerName ?? "Unknown customer"} ·{" "}
                {getSupportCategoryLabel(query.data.category)} ·{" "}
                {query.data.status}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {query.data.organizationName ?? "Unknown organisation"} ·{" "}
                {query.data.locationName ?? "All locations"}
              </p>
            </div>
            {query.data.status !== "resolved" ? (
              <Button
                variant="secondary"
                disabled={updateStatusMutation.isPending}
                onClick={() => void resolve()}
              >
                {updateStatusMutation.isPending
                  ? "Resolving…"
                  : "Mark resolved"}
              </Button>
            ) : null}
          </header>
          <ol className="space-y-3" aria-label="Support conversation">
            {query.data.messages.map((message) => (
              <li
                key={message.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex justify-between gap-3 text-xs text-slate-500">
                  <span className="font-semibold">
                    {message.authorType === "user"
                      ? (query.data.customerName ?? "Customer")
                      : "RocketRota support"}
                  </span>
                  <time
                    className="shrink-0 text-right"
                    dateTime={message.createdAt}
                  >
                    {new Date(message.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {message.body}
                </p>
              </li>
            ))}
          </ol>
          <form
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-4"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            <h2 className="font-semibold">Reply to customer</h2>
            <form.Field name="body">
              {(field) => (
                <div className="space-y-1">
                  <label
                    htmlFor="admin-support-reply"
                    className="text-sm font-medium"
                  >
                    Message
                  </label>
                  <textarea
                    id="admin-support-reply"
                    className="min-h-32 w-full rounded-md border border-slate-300 p-3 text-sm"
                    maxLength={5000}
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                </div>
              )}
            </form.Field>
            {error ? (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <Button
              type="submit"
              disabled={replyMutation.isPending || form.state.isSubmitting}
            >
              {replyMutation.isPending ? "Sending…" : "Send reply"}
            </Button>
          </form>
        </>
      ) : null}
    </div>
  )
}

export { SupportThreadPage }
