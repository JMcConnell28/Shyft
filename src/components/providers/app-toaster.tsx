"use client"

import { Toaster } from "react-hot-toast"

function AppToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      containerStyle={{
        inset: 16,
      }}
      toastOptions={{
        className:
          "rounded-2xl border border-border bg-popover px-4 py-3 text-sm text-popover-foreground shadow-lg shadow-slate-950/10",
        duration: 4000,
        success: {
          iconTheme: {
            primary: "oklch(0.5 0.134 242.749)",
            secondary: "oklch(0.977 0.013 236.62)",
          },
        },
        error: {
          iconTheme: {
            primary: "oklch(0.577 0.245 27.325)",
            secondary: "oklch(1 0 0)",
          },
        },
      }}
    />
  )
}

export { AppToaster }
