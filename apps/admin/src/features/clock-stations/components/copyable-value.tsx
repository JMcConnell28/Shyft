"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function CopyableValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false)
  const [copyFailed, setCopyFailed] = React.useState(false)

  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setCopyFailed(false)
    } catch {
      setCopied(false)
      setCopyFailed(true)
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <div className="flex min-w-0 gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
          {value}
        </code>
        <Button aria-label={`Copy ${label}`} onClick={copyValue} variant="secondary">
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          <span className="sr-only sm:not-sr-only">{copied ? "Copied" : "Copy"}</span>
        </Button>
      </div>
      {copyFailed && <p className="text-xs text-red-600">Could not copy {label}. Select and copy the value above.</p>}
    </div>
  )
}

export { CopyableValue }
