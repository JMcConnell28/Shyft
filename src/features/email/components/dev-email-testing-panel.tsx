"use client"

import { useState } from "react"
import { useServerFn } from "@tanstack/react-start"
import { FlaskConicalIcon, MailIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { devEmailOptions } from "@/features/email/constants/dev-email-options"
import type { DevEmailType } from "@/features/email/constants/dev-email-options"
import { sendDevTestEmail } from "@/features/email/server-fns"
import { showErrorToast, showSuccessToast } from "@/lib/toast"

function DevEmailTestingPanel({
  workspaceSlug,
  workspaceType,
}: {
  workspaceSlug: string
  workspaceType?: "location" | "organization"
}) {
  const sendDevTestEmailFn = useServerFn(sendDevTestEmail)
  const [emailType, setEmailType] = useState<DevEmailType>("workspace-welcome")
  const [isSending, setIsSending] = useState(false)

  if (!import.meta.env.DEV) {
    return null
  }

  async function handleSend() {
    setIsSending(true)

    try {
      await sendDevTestEmailFn({
        data: {
          emailType,
          workspaceSlug,
          workspaceType,
        },
      })
      showSuccessToast("Test email sent.")
    } catch (error) {
      showErrorToast(error, {
        fallbackMessage: "We could not send that test email.",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-amber-300/80 bg-amber-50 px-3 py-3 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2">
        <FlaskConicalIcon className="mt-0.5 size-3.5 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-medium">Email testing</p>
          <p className="text-xs text-amber-950/75">
            Sends to the configured Resend test recipient in development.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <NativeSelect
          value={emailType}
          aria-label="Test email type"
          className="w-48"
          onChange={(event) => setEmailType(event.target.value as DevEmailType)}
        >
          {devEmailOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isSending}
          onClick={() => {
            void handleSend()
          }}
        >
          <MailIcon data-icon="inline-start" />
          {isSending ? "Sending..." : "Send"}
        </Button>
      </div>
    </div>
  )
}

export { DevEmailTestingPanel }
