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
    <main className="flex flex-1 bg-[#f6f8fc] px-4 py-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[#10204b] sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <Link
          to="/app/$workspaceSlug/support"
          params={{ workspaceSlug }}
          className="w-fit text-sm font-semibold text-[#0968f5] hover:underline"
        >
          ← All support requests
        </Link>
        {thread.isPending ? (
          <p className="py-10 text-center text-sm text-[#61709a]">
            Loading conversation…
          </p>
        ) : null}
        {thread.isError ? (
          <p
            role="alert"
            className="py-10 text-center text-sm text-destructive"
          >
            We could not load this conversation.
          </p>
        ) : null}
        {thread.data ? (
          <>
            <header>
              <h1 className="text-[1.75rem] leading-tight font-extrabold tracking-[-0.045em] sm:text-3xl">
                {thread.data.subject}
              </h1>
              <p className="mt-2 text-sm font-medium text-[#61709a] capitalize">
                {thread.data.status} · Updated{" "}
                {new Date(thread.data.updatedAt).toLocaleString()}
              </p>
            </header>
            <section
              aria-label="Support conversation"
              className="overflow-hidden rounded-xl border border-[#dfe5f0] bg-white shadow-[0_5px_18px_rgba(30,50,96,0.04)]"
            >
              <ol className="divide-y divide-[#e7ebf3]">
                {thread.data.messages.map((message) => (
                  <li key={message.id} className="px-4 py-5 sm:px-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7180a2]">
                      <span className="font-bold text-[#10204b]">
                        {message.authorType === "user"
                          ? "You"
                          : "RocketRota support"}
                      </span>
                      <time dateTime={message.createdAt}>
                        {new Date(message.createdAt).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-2 text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap text-[#405078]">
                      {message.body}
                    </p>
                  </li>
                ))}
              </ol>
              {thread.data.status !== "closed" ? (
                <form
                  className="space-y-3 border-t border-[#e7ebf3] bg-[#fbfcff] px-4 py-5 sm:px-5"
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
                          className="text-sm font-semibold"
                        >
                          Reply
                        </label>
                        <Textarea
                          id="support-reply"
                          className="rounded-lg border-[#dfe5f0] bg-white"
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
                    className="h-10 rounded-lg bg-[#0867f2] px-4 font-semibold text-white hover:bg-[#075edc]"
                    disabled={
                      form.state.isSubmitting || replyMutation.isPending
                    }
                  >
                    {replyMutation.isPending ? "Sending…" : "Send reply"}
                  </Button>
                </form>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </main>
  )
}

export { CustomerSupportThread }
