"use client"

import { CircleCheckIcon, CircleXIcon } from "lucide-react"
import { Toaster } from "sonner"

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      theme="system"
      closeButton
      expand
      gap={10}
      offset={16}
      mobileOffset={{
        top: "max(16px, env(safe-area-inset-top))",
        right: 16,
        left: 16,
      }}
      duration={6500}
      swipeDirections={["left", "right"]}
      icons={{
        success: <CircleCheckIcon className="size-5 text-blue-600" />,
        error: <CircleXIcon className="size-5 text-red-600" />,
      }}
      toastOptions={{
        closeButtonAriaLabel: "Dismiss notification",
        classNames: {
          toast:
            "!rounded-2xl !border-border !bg-popover !py-3 !pr-12 !pl-4 !font-sans !text-sm !text-popover-foreground !shadow-lg !shadow-slate-950/10",
          closeButton:
            "!top-1/2 !right-2 !left-auto !size-8 !translate-x-0 !-translate-y-1/2 !transform-none !border-0 !bg-transparent !text-muted-foreground hover:!bg-muted focus-visible:!outline-2 focus-visible:!outline-ring",
        },
      }}
    />
  )
}

export { AppToaster }
