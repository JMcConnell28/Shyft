import { useForm } from "@tanstack/react-form"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSupportMutations } from "@/features/support/hooks/use-support-mutations"
import { useSupportThread } from "@/features/support/hooks/use-support-threads"
import { supportQueryKeys } from "@/features/support/query-options"
import { replyToSupportThreadSchema } from "@/features/support/schemas"
import { getErrorMessage } from "@/lib/errors"
import { getFieldError } from "@/lib/forms"
import { createZodFieldValidator } from "@/lib/validation"

function CustomerSupportThread({
  organizationId,
  threadId,
  workspaceSlug,
}: {
  organizationId: string
  threadId: string
  workspaceSlug: string
}) {
  const queryClient = useQueryClient()
  const thread = useSupportThread(organizationId, threadId)
  const { replyMutation } = useSupportMutations(organizationId)
  const [error, setError] = useState<string | null>(null)
  const lastMessageId = thread.data?.messages.at(-1)?.id

  useEffect(() => {
    if (!lastMessageId) return
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.lists(organizationId),
    })
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.notifications(organizationId),
    })
  }, [lastMessageId, organizationId, queryClient])

  const form = useForm({
    defaultValues: { body: "" },
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        const data = replyToSupportThreadSchema.parse({
          ...value,
          organizationId,
          threadId,
        })
        await replyMutation.mutateAsync(data)
        form.reset()
      } catch (submissionError) {
        setError(
          getErrorMessage(submissionError, "We could not send your reply.")
        )
      }
    },
  })

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-5 md:p-8">
      <Link
        to="/app/$workspaceSlug/support"
        params={{ workspaceSlug }}
        className="text-sm font-medium text-primary hover:underline"
      >
        ← All support requests
      </Link>
      {thread.isPending ? <p>Loading conversation…</p> : null}
      {thread.isError ? (
        <p role="alert" className="text-sm text-destructive">
          We could not load this conversation.
        </p>
      ) : null}
      {thread.data ? (
        <>
          <header>
            <h1 className="text-2xl font-bold">{thread.data.subject}</h1>
            <p className="mt-1 text-sm text-muted-foreground capitalize">
              {thread.data.status}
            </p>
          </header>
          <ol className="space-y-3" aria-label="Support conversation">
            {thread.data.messages.map((message) => (
              <li
                key={message.id}
                className="rounded-xl border bg-background p-4"
              >
                <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold">
                    {message.authorType === "user"
                      ? "You"
                      : "RocketRota support"}
                  </span>
                  <time dateTime={message.createdAt}>
                    {new Date(message.createdAt).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {message.body}
                </p>
              </li>
            ))}
          </ol>
          {thread.data.status !== "closed" ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault()
                void form.handleSubmit()
              }}
            >
              <form.Field
                name="body"
                validators={{
                  onSubmit: createZodFieldValidator(
                    replyToSupportThreadSchema.shape.body
                  ),
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <label
                      htmlFor="support-reply"
                      className="text-sm font-medium"
                    >
                      Reply
                    </label>
                    <Textarea
                      id="support-reply"
                      rows={5}
                      maxLength={5000}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                    />
                    {getFieldError(field) ? (
                      <p className="text-sm text-destructive">
                        {getFieldError(field)}
                      </p>
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
                disabled={form.state.isSubmitting || replyMutation.isPending}
              >
                {replyMutation.isPending ? "Sending…" : "Send reply"}
              </Button>
            </form>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

export { CustomerSupportThread }
